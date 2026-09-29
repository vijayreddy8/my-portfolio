const express = require("express");
const path = require("path");
const nodemailer = require("nodemailer");

const app = express();

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true }));

// Serve frontend
app.use(express.static(path.join(__dirname, "../public")));

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "Vijay Simha Reddy Portfolio API",
    message: "Backend is running successfully",
    timestamp: new Date().toISOString()
  });
});

// Contact form
app.post("/api/contact", async (req, res) => {
  try {
    const name = String(req.body.name || "").trim().slice(0, 80);
    const email = String(req.body.email || "").trim().slice(0, 160);
    const message = String(req.body.message || "").trim().slice(0, 3000);

    if (!name || !email || !message) {
      return res.status(400).json({
        ok: false,
        message: "Please fill in your name, email and message."
      });
    }

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!emailValid) {
      return res.status(400).json({
        ok: false,
        message: "Please enter a valid email address."
      });
    }

    // Send email if SMTP environment variables are configured
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
          `New message from your portfolio\n\n` +
          `Name: ${name}\n` +
          `Email: ${email}\n\n` +
          `Message:\n${message}`
      });

      return res.json({
        ok: true,
        emailSent: true,
        message: "Message sent successfully. I will get back to you soon."
      });
    }

    // If SMTP is not configured
    return res.json({
      ok: true,
      emailSent: false,
      message:
        "Message received. Email delivery is not configured yet."
    });

  } catch (error) {
    console.error("Contact API error:", error);

    return res.status(500).json({
      ok: false,
      message: "Something went wrong. Please try WhatsApp instead."
    });
  }
});

module.exports = app;