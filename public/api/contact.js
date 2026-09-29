const nodemailer = require("nodemailer");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      message: "Method not allowed"
    });
  }

  try {
    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "").trim();
    const message = String(req.body?.message || "").trim();

    if (!name || !email || !message) {
      return res.status(400).json({
        ok: false,
        message: "Please fill in all fields."
      });
    }

    if (
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.CONTACT_TO
    ) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure:
          String(process.env.SMTP_SECURE).toLowerCase() === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: process.env.CONTACT_TO,
        replyTo: email,
        subject: `Portfolio Message from ${name}`,
        text:
          `Name: ${name}\n` +
          `Email: ${email}\n\n` +
          `Message:\n${message}`
      });

      return res.status(200).json({
        ok: true,
        emailSent: true,
        message: "Message sent successfully!"
      });
    }

    return res.status(200).json({
      ok: true,
      emailSent: false,
      message: "Message received successfully."
    });

  } catch (error) {
    console.error("Contact error:", error);

    return res.status(500).json({
      ok: false,
      message: "Unable to send message right now."
    });
  }
};