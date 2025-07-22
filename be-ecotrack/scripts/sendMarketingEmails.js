// scripts/sendMarketingEmails.js
require('dotenv').config();
const { Pool } = require('pg');
const nodemailer = require('nodemailer');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});

// 🌱 Rotating Tips
const tips = [
  "♻️ Rinse bottles before recycling to avoid contamination.",
  "🌱 Bring your own bag to reduce plastic waste.",
  "🔌 Unplug devices not in use to save energy.",
  "🚲 Bike instead of driving for short trips.",
  "📦 Reuse packaging materials when possible.",
  "💧 Turn off the tap while brushing your teeth.",
  "🛍 Shop second-hand before buying new.",
  "🍃 Start composting food waste at home.",
];

// ✉️ Mailer
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
    console.error(`❌ Email error to ${to}:`, err);
  }
};

// 🔁 Send Daily Tips Function
const sendTips = async () => {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `SELECT id, name, email, last_tip_index
       FROM users
       WHERE marketing_opt_in = true`
    );

    for (const user of res.rows) {
      const index = user.last_tip_index || 0;
      const tip = tips[index];

      const html = `
        <h2>Hi ${user.name},</h2>
        <p>Here's your eco tip for today:</p>
        <blockquote style="font-size: 1.2em;">${tip}</blockquote>
        <p>Let’s take action today 🌍</p>
        <a href="${process.env.FRONTEND_URL}" style="display: inline-block; padding: 10px 15px; background: green; color: white; text-decoration: none; border-radius: 5px;">Open EcoTrack</a>
      `;

      await sendEmail({
        to: user.email,
        subject: '🌱 Your Daily Eco Tip!',
        html,
      });

      const nextIndex = (index + 1) % tips.length;
      await client.query(
        `UPDATE users SET last_tip_index = $1 WHERE id = $2`,
        [nextIndex, user.id]
      );
    }

    console.log(`✅ Sent daily tips to ${res.rows.length} users.`);
  } catch (err) {
    console.error('❌ Error sending marketing emails:', err);
    throw err; // so Vercel serverless function catches it too
  } finally {
    client.release();
  }
};

// 🧪 CLI mode (only runs if called directly)
if (require.main === module) {
  sendTips();
}

// 📤 Export for Vercel or other use
module.exports = { sendTips };
