const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Optional: define allowed waste types
const ALLOWED_WASTE_TYPES = ['plastic', 'glass', 'metal', 'paper', 'organic'];

module.exports = (pool) => {
  // ♻️ GET: Fetch logs
  router.get('/recycling-logs', authMiddleware, async (req, res) => {
    const { user } = req;

    try {
      const logsRes = await pool.query(
        `SELECT waste_type, quantity, timestamp
         FROM recycling_logs
         WHERE user_id = $1
         ORDER BY timestamp DESC;`,
        [user.userId]
      );

      res.status(200).json({ success: true, data: logsRes.rows });
    } catch (err) {
      console.error('❌ Error fetching logs:', err);
      res.status(500).json({ error: 'Failed to fetch recycling logs' });
    }
  });

  // ♻️ POST: Add new log
  router.post('/recycling-logs', authMiddleware, async (req, res) => {
    const { user } = req;
    let { waste_type, quantity } = req.body;

    // ✅ Validation
    if (!waste_type || !quantity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!ALLOWED_WASTE_TYPES.includes(waste_type)) {
      return res.status(400).json({ error: `Invalid waste_type. Allowed: ${ALLOWED_WASTE_TYPES.join(', ')}` });
    }

    quantity = parseFloat(quantity);
    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be a number greater than 0' });
    }

    try {
      const result = await pool.query(
        `INSERT INTO recycling_logs (user_id, waste_type, quantity, timestamp)
         VALUES ($1, $2, $3, NOW()) RETURNING *;`,
        [user.userId, waste_type, quantity]
      );

      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error('❌ Error inserting recycling log:', err);
      res.status(500).json({ error: 'Failed to add recycling log' });
    }
  });

  return router;
};
