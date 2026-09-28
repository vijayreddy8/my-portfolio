const express = require('express');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

const app = express();

const PORT = process.env.PORT || 3000;
const root = __dirname;

const publicDir = path.join(root, 'public');
const dataDir = path.join(root, 'data');
const messagesFile = path.join(dataDir, 'messages.json');

// --------------------------------------------------
// DATA DIRECTORY / CONTACT MESSAGE STORAGE
// --------------------------------------------------

fs.mkdirSync(dataDir, { recursive: true });

if (!fs.existsSync(messagesFile)) {
  fs.writeFileSync(messagesFile, '[]', 'utf8');
}

// --------------------------------------------------
// MIDDLEWARE
// --------------------------------------------------

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true }));

// Serve portfolio frontend
app.use(express.static(publicDir));

// --------------------------------------------------
// HELPER FUNCTIONS
// --------------------------------------------------

function clean(value, max = 2000) {
  return String(value ?? '')
    .trim()
    .slice(0, max);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// --------------------------------------------------
// BACKEND HEALTH CHECK
// --------------------------------------------------

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'vijay-portfolio-backend',
    timestamp: new Date().toISOString()
  });
});

// --------------------------------------------------
// CONTACT FORM
// --------------------------------------------------

app.post('/api/contact', async (req, res) => {
  const name = clean(req.body.name, 80);
  const email = clean(req.body.email, 160);
  const message = clean(req.body.message, 3000);

  // Validate required fields
  if (!name || !email || !message) {
    return res.status(400).json({
      ok: false,
      message: 'Please fill in your name, email and message.'
    });
  }

  // Validate email
  if (!isValidEmail(email)) {
    return res.status(400).json({
      ok: false,
      message: 'Please enter a valid email address.'
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
    // Read existing messages
    let current = [];

    try {
      current = JSON.parse(
        fs.readFileSync(messagesFile, 'utf8') || '[]'
      );

      if (!Array.isArray(current)) {
        current = [];
      }
    } catch {
      current = [];
    }

    // Save new message
    current.push(entry);

    fs.writeFileSync(
      messagesFile,
      JSON.stringify(current, null, 2),
      'utf8'
    );

    // ------------------------------------------------
    // OPTIONAL EMAIL NOTIFICATION
    // ------------------------------------------------

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
          secure:
            String(process.env.SMTP_SECURE).toLowerCase() === 'true',
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
          text:
            `Name: ${name}\n` +
            `Email: ${email}\n\n` +
            `Message:\n${message}`
        });

        emailSent = true;
      } catch (mailError) {
        console.error(
          'Email notification failed:',
          mailError.message
        );

        // Message is already saved, so don't fail the contact request.
        emailSent = false;
      }
    }

    return res.json({
      ok: true,
      emailSent,
      message: emailSent
        ? 'Message sent successfully. I will get back to you soon.'
        : 'Message received successfully. It has been saved.'
    });

  } catch (error) {
    console.error('Contact form error:', error);

    return res.status(500).json({
      ok: false,
      message:
        'The message could not be saved. Please try WhatsApp instead.'
    });
  }
});

// --------------------------------------------------
// FRONTEND FALLBACK
// --------------------------------------------------
// Express 5 requires named wildcards.
// DO NOT change this back to app.get('*', ...)
// --------------------------------------------------

app.get('/{*splat}', (_req, res) => {
  res.sendFile(
    path.join(publicDir, 'index.html')
  );
});

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

app.listen(PORT, () => {
  console.log('');
  console.log('========================================');
  console.log('   VIJAY DEVOPS PORTFOLIO');
  console.log('========================================');
  console.log(`Portfolio: http://localhost:${PORT}`);
  console.log(`Health:    http://localhost:${PORT}/api/health`);
  console.log('Backend:   ONLINE');
  console.log('========================================');
  console.log('');
});