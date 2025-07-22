// 📈 routes/progress.js
const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

module.exports = (pool) => {
  /**
   * GET /api/progress
   * Returns total bottles, total mass (kg), and calculated eco points for the authenticated user.
   */
  router.get('/progress', authMiddleware, async (req, res) => {
    const { user } = req;

    try {
      const result = await pool.query(
        `SELECT
           SUM(CASE WHEN waste_type = 'plastic_bottle' THEN quantity ELSE 0 END) AS total_bottles,
           SUM(CASE WHEN waste_type = 'mass' THEN quantity ELSE 0 END) AS total_mass
         FROM recycling_logs
         WHERE user_id = $1`,
        [user.userId]
      );

      const totals = result.rows[0] || {};
      const totalBottles = Number(totals.total_bottles) || 0;
      const totalMass = Number(totals.total_mass) || 0;

      // 🎯 Simple eco point formula (can be refined later)
      const points = totalBottles * 5 + totalMass * 10;

      res.json({ totalBottles, totalMass, points });
    } catch (err) {
      console.error('❌ Error fetching progress:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  return router;
};
