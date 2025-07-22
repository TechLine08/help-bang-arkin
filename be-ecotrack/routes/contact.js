const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

module.exports = (pool) => {
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  router.post('/contact', async (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }

    try {
      // Save to database
      await pool.query(
        `INSERT INTO contact_messages (name, email, message) VALUES ($1, $2, $3)`,
        [name, email, message]
      );

      // Send via Mailtrap
      await transporter.sendMail({
        from: process.env.FROM_EMAIL,
        to: process.env.MAIL_USER,
        subject: 'EcoTrack Contact Form Submission',
        html: `<p><strong>Name:</strong> ${name}</p>
               <p><strong>Email:</strong> ${email}</p>
               <p><strong>Message:</strong><br/>${message}</p>`,
      });

      res.status(201).json({ success: true });
    } catch (err) {
      console.error('❌ Error handling contact form:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  return router;
};
