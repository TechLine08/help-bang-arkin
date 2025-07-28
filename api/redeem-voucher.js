// File: /api/redeem-voucher.js

import { Pool } from 'pg';
import nodemailer from 'nodemailer';

// ✅ PostgreSQL setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const ADMIN_EMAIL = 'orbital.ecotrack@gmail.com';

// ✅ Email Transporter
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export default async function handler(req, res) {
  // ✅ CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    console.warn('⚠️ Invalid method:', req.method);
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { user_id, voucher_id } = req.body;
  console.log('📥 Redeem request received:', { user_id, voucher_id });

  if (!user_id || !voucher_id) {
    console.error('❌ Missing user_id or voucher_id');
    return res.status(400).json({ error: 'Missing user_id or voucher_id' });
  }

  try {
    // ✅ Fetch user
    const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [user_id]);
    const user = userRes.rows[0];
    if (!user) {
      console.error('❌ User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    // ✅ Fetch voucher
    const voucherRes = await pool.query('SELECT * FROM vouchers WHERE id = $1', [voucher_id]);
    const voucher = voucherRes.rows[0];
    if (!voucher) {
      console.error('❌ Voucher not found');
      return res.status(404).json({ error: 'Voucher not found' });
    }

    if (voucher.stock <= 0) {
      return res.status(400).json({ error: 'Voucher out of stock' });
    }

    if (user.points < voucher.points_required) {
      return res.status(400).json({ error: 'Insufficient points' });
    }

    // ✅ Transaction: update stock, deduct points, insert redemption
    await pool.query('BEGIN');

    await pool.query(
      'UPDATE vouchers SET stock = stock - 1 WHERE id = $1',
      [voucher_id]
    );

    await pool.query(
      'UPDATE users SET points = points - $1 WHERE id = $2',
      [voucher.points_required, user_id]
    );

    await pool.query(
      'INSERT INTO redemptions (user_id, voucher_id, redeemed_at) VALUES ($1, $2, NOW())',
      [user_id, voucher_id]
    );

    await pool.query('COMMIT');
    console.log('✅ Stock, points updated, redemption logged');

    // ✅ Fetch updated point balance
    const updatedUserRes = await pool.query('SELECT points FROM users WHERE id = $1', [user_id]);
    const updatedPoints = updatedUserRes.rows[0].points;

    // ✅ Send email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; background: #f5f7fa; padding: 30px;">
        <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); padding: 30px;">
          <h2 style="margin-bottom: 20px;">🎁 Voucher Redemption Confirmation</h2>
          <p><strong>Name:</strong> ${user.name}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Voucher:</strong> ${voucher.title}</p>
          <p><strong>Points Used:</strong> ${voucher.points_required}</p>
          <p><strong>Redemption Time:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })}</p>
          <p style="margin-top: 20px;">Thank you for taking action with <strong>EcoTrack</strong>. Your eco-points just made a difference! 🌍♻️</p>
          <p>If you have any questions, feel free to contact our support.</p>
          <hr style="margin: 30px 0;">
          <p style="text-align: center; color: #777; font-size: 0.85em;">
            Voucher redeemed from the <strong>EcoTrack</strong> platform.<br>
            Powered by Orbital Indonesia.
          </p>
        </div>
        <p style="text-align: center; color: #999; font-size: 0.8em; margin-top: 30px;">
          &copy; ${new Date().getFullYear()} EcoTrack Movement. All rights reserved.
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: `"EcoTrack Admin" <${ADMIN_EMAIL}>`,
      to: user.email,
      subject: `🎉 Voucher Redeemed: ${voucher.title}`,
      html: emailHtml,
    });

    console.log('📧 Email sent to:', user.email);

    return res.status(200).json({
      message: 'Voucher redeemed and email sent.',
      updated_points: updatedPoints,
    });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('❌ Error during redemption:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
