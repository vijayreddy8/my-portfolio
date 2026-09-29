const nodemailer = require("nodemailer");

function clean(value, max = 2000) {
  return String(value ?? "").trim().slice(0, max);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      message: "Method not allowed"
    });
  }

  const name = clean(req.body?.name, 80);
  const email = clean(req.body?.email, 160);
  const message = clean(req.body?.message, 3000);

  if (!name || !email || !message) {
    return res.status(400).json({
      ok: false,
      message: "Please fill in your name, email and message."
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      ok: false,
      message: "Please enter a valid email address."
    });
  }

  // Email notification is optional. Configure these in Vercel Environment Variables.
  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.CONTACT_TO
  ) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: process.env.CONTACT_TO,
        replyTo: email,
        subject: `Portfolio message from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
      });

      return res.status(200).json({
        ok: true,
        emailSent: true,
        message: "Message sent successfully. I will get back to you soon."
      });
    } catch (error) {
      console.error("Email notification failed:", error.message);
      return res.status(200).json({
        ok: true,
        emailSent: false,
        message: "Message received, but email notification is not configured correctly yet."
      });
    }
  }

  return res.status(200).json({
    ok: true,
    emailSent: false,
    message: "Message received. Email notification is not configured yet."
  });
};
