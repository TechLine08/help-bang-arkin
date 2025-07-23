// 📈 routes/progress.js
const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

module.exports = (pool) => {
  /**
   * 🟢 GET /api/progress
   * Authenticated: Returns total bottles, mass, and eco points for the current user.
   */
  router.get('/progress', authMiddleware, async (req, res) => {
    const { userId } = req.user;

    try {
      const { rows } = await pool.query(
        `
        SELECT
          COALESCE(SUM(CASE WHEN waste_type = 'plastic_bottle' THEN quantity ELSE 0 END), 0) AS total_bottles,
          COALESCE(SUM(CASE WHEN waste_type = 'mass' THEN quantity ELSE 0 END), 0) AS total_mass
        FROM recycling_logs
        WHERE user_id = $1
        `,
        [userId]
      );

      const { total_bottles, total_mass } = rows[0];

      // 🎯 Points calculation (configurable later)
      const points = total_bottles * 5 + total_mass * 10;

      res.status(200).json({
        success: true,
        data: {
          totalBottles: total_bottles,
          totalMass: total_mass,
          points,
        },
      });
    } catch (err) {
      console.error('❌ Error fetching user progress:', err);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });

  return router;
};
