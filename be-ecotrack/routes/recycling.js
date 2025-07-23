const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

const ALLOWED_WASTE_TYPES = ['plastic', 'glass', 'metal', 'paper', 'organic'];

module.exports = (pool) => {
  // ♻️ GET: Fetch all logs for the authenticated user
  router.get('/recycling-logs', authMiddleware, async (req, res) => {
    const { userId } = req.user;

    try {
      const { rows } = await pool.query(
        `SELECT id, waste_type, quantity, timestamp
         FROM recycling_logs
         WHERE user_id = $1
         ORDER BY timestamp DESC`,
        [userId]
      );

      res.status(200).json({ success: true, data: rows });
    } catch (err) {
      console.error('❌ Error fetching recycling logs:', err);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });

  // ♻️ POST: Submit a new recycling log
  router.post('/recycling-logs', authMiddleware, async (req, res) => {
    const { userId } = req.user;
    let { waste_type, quantity } = req.body;

    // 🛡️ Validation
    if (!waste_type || quantity == null)
      return res.status(400).json({ success: false, error: 'Missing required fields' });

    if (!ALLOWED_WASTE_TYPES.includes(waste_type))
      return res.status(400).json({
        success: false,
        error: `Invalid waste_type. Allowed: ${ALLOWED_WASTE_TYPES.join(', ')}`
      });

    quantity = parseFloat(quantity);
    if (isNaN(quantity) || quantity <= 0)
      return res.status(400).json({ success: false, error: 'Quantity must be a positive number' });

    try {
      const { rows } = await pool.query(
        `INSERT INTO recycling_logs (user_id, waste_type, quantity, timestamp)
         VALUES ($1, $2, $3, NOW())
         RETURNING id, waste_type, quantity, timestamp`,
        [userId, waste_type, quantity]
      );

      res.status(201).json({ success: true, data: rows[0] });
    } catch (err) {
      console.error('❌ Error inserting recycling log:', err);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });

  return router;
};
