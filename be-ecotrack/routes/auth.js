const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
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

  const sendEmail = async ({ to, subject, html }) => {
    try {
      await transporter.sendMail({
        from: process.env.FROM_EMAIL,
        to,
        subject,
        html,
      });
    } catch (err) {
      console.error('Error sending email:', err);
    }
  };

  // 🆕 Create or Upsert User (for Google or Email signup)
  router.post('/users', async (req, res) => {
    const { name, email, marketing_opt_in = false } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Missing fields' });

    try {
      await pool.query(
        `INSERT INTO users (name, email, marketing_opt_in)
         VALUES ($1, $2, $3)
         ON CONFLICT (email)
         DO UPDATE SET name = EXCLUDED.name, marketing_opt_in = EXCLUDED.marketing_opt_in`,
        [name, email, marketing_opt_in]
      );
      res.status(200).json({ success: true });
    } catch (err) {
      console.error('User insert/upsert error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // 🔐 Login
  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
      const user = result.rows[0];

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // 🔑 Forgot Password
  router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
      const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
      const user = result.rows[0];
      if (!user) return res.status(200).json({ success: true });

      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 3600000);
      await pool.query(
        `UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3`,
        [token, expires, user.id]
      );

      const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
      await sendEmail({
        to: email,
        subject: 'Reset your EcoTrack password',
        html: `<p>Click the link below to reset your password:</p><a href="${resetLink}">${resetLink}</a>`
      });

      res.json({ success: true });
    } catch (err) {
      console.error('Forgot password error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // 🔄 Reset Password
  router.post('/reset-password/:token', async (req, res) => {
    const { password } = req.body;
    const { token } = req.params;
    try {
      const result = await pool.query(
        `SELECT * FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()`,
        [token]
      );
      const user = result.rows[0];
      if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

      const hashed = await bcrypt.hash(password, 10);
      await pool.query(
        `UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2`,
        [hashed, user.id]
      );

      res.json({ success: true });
    } catch (err) {
      console.error('Reset password error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
};
