const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

module.exports = (pool) => {
  // 🎁 Get Available Vouchers (Public route)
  router.get('/vouchers', async (req, res) => {
    try {
      const result = await pool.query(`SELECT id, title, description, points_required FROM vouchers ORDER BY id`);
      res.json(result.rows);
    } catch (err) {
      console.error('❌ Error fetching vouchers:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // 🎁 Redeem a Voucher (Authenticated)
  router.post('/redeem', authMiddleware, async (req, res) => {
    const { voucher_id } = req.body;
    const { userId } = req.user;

    if (!voucher_id || isNaN(voucher_id)) {
      return res.status(400).json({ error: 'Valid voucher_id is required.' });
    }

    try {
      // Check if voucher exists
      const voucherRes = await pool.query(`SELECT * FROM vouchers WHERE id = $1`, [voucher_id]);
      const voucher = voucherRes.rows[0];
      if (!voucher) return res.status(404).json({ error: 'Voucher not found.' });

      // Optional: Check if already redeemed
      const redemptionCheck = await pool.query(
        `SELECT * FROM redemptions WHERE user_id = $1 AND voucher_id = $2`,
        [userId, voucher_id]
      );
      if (redemptionCheck.rows.length > 0) {
        return res.status(409).json({ error: 'You have already redeemed this voucher.' });
      }

      // Insert redemption
      await pool.query(
        `INSERT INTO redemptions (user_id, voucher_id, redeemed_at) VALUES ($1, $2, NOW())`,
        [userId, voucher_id]
      );

      res.status(201).json({ success: true, message: 'Voucher redeemed successfully.' });
    } catch (err) {
      console.error('❌ Error redeeming voucher:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  return router;
};
