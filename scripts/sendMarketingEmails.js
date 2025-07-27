require('dotenv').config();
const { Pool } = require('pg');
const nodemailer = require('nodemailer');

// DB Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Daily Tips — Now with title and content
const tips = [
  {
    title: "♻️ Rinse Before You Recycle",
    content: "Rinse bottles before recycling to avoid contamination and ensure better processing.",
  },
  {
    title: "🌱 Bring Your Own Bag",
    content: "Always carry a reusable bag when shopping to reduce single-use plastic waste.",
  },
  {
    title: "🔌 Unplug Idle Devices",
    content: "Unplug electronics that aren’t in use to conserve energy and lower your bills.",
  },
  {
    title: "🚲 Short Trips, Big Impact",
    content: "Use a bike or walk for short distances to reduce your carbon footprint.",
  },
  {
    title: "📦 Reuse Packaging",
    content: "Boxes, wraps, and even bubble wrap can be reused before discarding them.",
  },
  {
    title: "💧 Save Water Daily",
    content: "Turn off the tap while brushing your teeth to save up to 8 gallons per day.",
  },
  {
    title: "🛍 Choose Second-Hand",
    content: "Before buying new, explore thrift stores for great deals and less waste.",
  },
  {
    title: "🍃 Start Composting",
    content: "Compost your food scraps to reduce landfill waste and enrich your garden soil.",
  },
];

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Send individual email
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

// Main logic
const sendTips = async () => {
  const client = await pool.connect();
  try {
    const { rows: users } = await client.query(`
      SELECT id, name, email, last_tip_index
      FROM users
      WHERE marketing_opt_in = true
    `);

    if (!users.length) {
      console.log('ℹ️ No subscribed users to send tips.');
      return;
    }

    for (const user of users) {
      const index = user.last_tip_index ?? 0;
      const { title, content } = tips[index];

      const html = `
        <div style="font-family: sans-serif; padding: 1rem;">
          <h2>Hi ${user.name},</h2>
          <p>Here's your eco tip for today:</p>
          <h3 style="color:#2e7d32;">${title}</h3>
          <p>${content}</p>
          <p>Let’s take action today 🌍</p>
          <a href="${process.env.FRONTEND_URL}" style="display:inline-block;padding:10px 20px;background:#388e3c;color:#fff;text-decoration:none;border-radius:5px;">Open EcoTrack</a>
        </div>
      `;

      await sendEmail({
        to: user.email,
        subject: `🌱 ${title}`,
        html,
      });

      const nextIndex = (index + 1) % tips.length;
      await client.query(`UPDATE users SET last_tip_index = $1 WHERE id = $2`, [nextIndex, user.id]);
    }

    console.log(`✅ Sent eco tips to ${users.length} users.`);
  } catch (err) {
    console.error('❌ Error during sendTips():', err);
    throw err;
  } finally {
    client.release();
  }
};

// CLI support
if (require.main === module) {
  sendTips();
}

// Export for API usage
module.exports = { sendTips };
