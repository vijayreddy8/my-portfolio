const express = require("express");
const path = require("path");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, "public");

// Middleware
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicDir));

function clean(value, max = 2000) {
  return String(value ?? "")
    .trim()
    .slice(0, max);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Health check
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    service: "vijay-portfolio-backend",
    timestamp: new Date().toISOString()
  });
});

// Contact form
app.post("/api/contact", async (req, res) => {
  const name = clean(req.body.name, 80);
  const email = clean(req.body.email, 160);
  const message = clean(req.body.message, 3000);

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

  // Vercel serverless functions have an ephemeral/read-only filesystem.
  // Do not try to save messages to messages.json here.
  // Email notification is optional and uses environment variables when configured.
  let emailSent = false;

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

      emailSent = true;
    } catch (mailError) {
      console.error("Email notification failed:", mailError.message);
    }
  }

  return res.status(200).json({
    ok: true,
    emailSent,
    message: emailSent
      ? "Message sent successfully. I will get back to you soon."
      : "Message received. Email notification is not configured yet."
  });
});

// Frontend fallback for client-side routes
app.get("/{*splat}", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

// Local development only. Vercel imports and uses the exported app.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Portfolio running at http://localhost:${PORT}`);
  });
}

module.exports = app;
