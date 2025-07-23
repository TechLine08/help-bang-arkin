// backend/scripts/sendMarketingEmails.js
require('dotenv').config();
const { Pool } = require('pg');
const nodemailer = require('nodemailer');

// DB Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});

// Daily Tips
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

// Mailer
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
      from: `"EcoTrack" <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error(`❌ Failed to send email to ${to}:`, err.message);
  }
};

const sendTips = async () => {
  const client = await pool.connect();
  try {
    const { rows: users } = await client.query(
      `SELECT id, name, email, last_tip_index
       FROM users
       WHERE marketing_opt_in = true`
    );

    if (!users.length) {
      console.log('ℹ️ No subscribed users to send tips.');
      return;
    }

    for (const user of users) {
      const index = user.last_tip_index ?? 0;
      const tip = tips[index];

      const html = `
        <div style="font-family: sans-serif; padding: 1rem;">
          <h2>Hi ${user.name},</h2>
          <p>Here's your eco tip for today:</p>
          <blockquote style="font-size: 1.2em; margin: 1em 0; color: #2e7d32;">${tip}</blockquote>
          <p>Let’s take action today 🌍</p>
          <a href="${process.env.FRONTEND_URL}" style="display:inline-block;padding:10px 20px;background:#388e3c;color:#fff;text-decoration:none;border-radius:5px;">Open EcoTrack</a>
        </div>
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

    console.log(`✅ Sent eco tips to ${users.length} users.`);
  } catch (err) {
    console.error('❌ Error during sendTips():', err);
    throw err;
  } finally {
    client.release();
  }
};

// 👇 CLI Support
if (require.main === module) {
  sendTips();
}

// 👇 Vercel or import support
module.exports = { sendTips };
