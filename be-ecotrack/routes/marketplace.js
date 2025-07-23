const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

module.exports = (pool) => {
  /**
   * 🎁 GET /api/vouchers
   * Public: List all available vouchers
   */
  router.get('/vouchers', async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT id, title, description, points_required
        FROM vouchers
        ORDER BY id
      `);
      res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
      console.error('❌ Error fetching vouchers:', err);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });

  /**
   * 🛍️ POST /api/redeem
   * Protected: Redeem a voucher by ID
   */
  router.post('/redeem', authMiddleware, async (req, res) => {
    const { voucher_id } = req.body;
    const { userId } = req.user;

    // Validate input
    if (!voucher_id || isNaN(voucher_id)) {
      return res.status(400).json({ success: false, error: 'Valid voucher_id is required.' });
    }

    try {
      // Check voucher exists
      const voucherRes = await pool.query(`SELECT * FROM vouchers WHERE id = $1`, [voucher_id]);
      const voucher = voucherRes.rows[0];
      if (!voucher) {
        return res.status(404).json({ success: false, error: 'Voucher not found.' });
      }

      // Check if user already redeemed it
      const alreadyRedeemed = await pool.query(
        `SELECT * FROM redemptions WHERE user_id = $1 AND voucher_id = $2`,
        [userId, voucher_id]
      );
      if (alreadyRedeemed.rows.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'You have already redeemed this voucher.',
        });
      }

      // Insert redemption
      await pool.query(
        `INSERT INTO redemptions (user_id, voucher_id, redeemed_at) VALUES ($1, $2, NOW())`,
        [userId, voucher_id]
      );

      res.status(201).json({
        success: true,
        message: 'Voucher redeemed successfully.',
        voucher: {
          id: voucher.id,
          title: voucher.title,
          pointsRequired: voucher.points_required,
        },
      });
    } catch (err) {
      console.error('❌ Error redeeming voucher:', err);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });

  return router;
};
