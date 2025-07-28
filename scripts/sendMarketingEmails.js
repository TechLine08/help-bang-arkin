// File: /scripts/sendMarketingEmails.js

require('dotenv').config();
const { Pool } = require('pg');
const nodemailer = require('nodemailer');

// ✅ PostgreSQL Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ✅ Nodemailer setup
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// ✅ Send individual email
const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"EcoTrack" <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      html,
    });
    console.log(`📤 Email sent to ${to}`);
  } catch (err) {
    console.error(`❌ Failed to send email to ${to}:`, err.message);
  }
};

// ✅ Main tip distribution logic (now DB-driven)
const sendTips = async () => {
  const client = await pool.connect();

  try {
    // 🔄 Fetch tips from DB
    const { rows: allTips } = await client.query(`
      SELECT id, title, content
      FROM eco_tips
      ORDER BY created_at ASC
    `);

    if (!allTips.length) {
      console.log('ℹ️ No tips available in eco_tips table.');
      return;
    }

    // 🔄 Fetch all subscribed users
    const { rows: users } = await client.query(`
      SELECT id, name, email, last_tip_index
      FROM users
      WHERE marketing_opt_in = true
    `);

    if (!users.length) {
      console.log('ℹ️ No users opted-in for tips.');
      return;
    }

    for (const user of users) {
      const index = user.last_tip_index ?? 0;
      const tip = allTips[index];

      if (!tip) continue; // skip if index exceeds tips array

      const html = `
        <div style="font-family: sans-serif; padding: 1rem;">
          <h2>Hi ${user.name},</h2>
          <p>Here's your eco tip for today:</p>
          <h3 style="color:#2e7d32;">${tip.title}</h3>
          <p>${tip.content}</p>
          <p>Let’s take action today 🌍</p>
          <a href="${process.env.FRONTEND_URL}" style="display:inline-block;padding:10px 20px;background:#388e3c;color:#fff;text-decoration:none;border-radius:5px;">Open EcoTrack</a>
        </div>
      `;

      await sendEmail({
        to: user.email,
        subject: `🌱 ${tip.title}`,
        html,
      });

      const nextIndex = (index + 1) % allTips.length;
      await client.query(
        `UPDATE users SET last_tip_index = $1 WHERE id = $2`,
        [nextIndex, user.id]
      );
    }

    console.log(`✅ Sent eco tips to ${users.length} user(s).`);
  } catch (err) {
    console.error('❌ Error during sendTips():', err);
    throw err;
  } finally {
    client.release();
  }
};

// ✅ CLI support
if (require.main === module) {
  sendTips();
}

// ✅ Export for API route
module.exports = { sendTips };
