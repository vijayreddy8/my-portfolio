const express = require("express");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");

const app = express();

const PORT = process.env.PORT || 3000;
const root = __dirname;
const dataDir = path.join(root, "data");
const messagesFile = path.join(dataDir, "messages.json");

fs.mkdirSync(dataDir, { recursive: true });

if (!fs.existsSync(messagesFile)) {
  fs.writeFileSync(messagesFile, "[]");
}

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(root, "public")));

function clean(value, max = 2000) {
  return String(value ?? "").trim().slice(0, max);
}

/* Health check */
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "vijay-portfolio-backend",
    timestamp: new Date().toISOString()
  });
});

/* Contact form */
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

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!emailOk) {
    return res.status(400).json({
      ok: false,
      message: "Please enter a valid email address."
    });
  }

  const entry = {
    id: Date.now().toString(),
    name,
    email,
    message,
    createdAt: new Date().toISOString()
  };

  try {
    const current = JSON.parse(
      fs.readFileSync(messagesFile, "utf8") || "[]"
    );

    current.push(entry);

    fs.writeFileSync(
      messagesFile,
      JSON.stringify(current, null, 2)
    );

    let emailSent = false;

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
        subject: `Portfolio message from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\n${message}`
      });

      emailSent = true;
    }

    return res.json({
      ok: true,
      emailSent,
      message: emailSent
        ? "Message sent successfully. I will get back to you soon."
        : "Message received successfully. It has been saved."
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      message:
        "The message could not be saved. Please try WhatsApp instead."
    });
  }
});

/*
  Express 5 compatible fallback route.
*/
app.get(/.*/, (_req, res) => {
  res.sendFile(
    path.join(root, "public", "index.html")
  );
});

/*
  Local development:
  npm start
*/
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(
      `Portfolio running at http://localhost:${PORT}`
    );
  });
}

/*
  Vercel needs the Express app exported.
*/
module.exports = app;