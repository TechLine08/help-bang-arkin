const express = require('express');

module.exports = (pool) => {
  const router = express.Router();

  console.log('🏆 Leaderboard route initialized');

  /**
   * 🧑‍🤝‍🧑 GET /api/leaderboard/users
   * Returns top 10 users based on total quantity recycled.
   */
  router.get('/leaderboard/users', async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT u.name, u.country, COALESCE(SUM(r.quantity), 0)::INT AS total_recycled
         FROM users u
         JOIN recycling_logs r ON u.id = r.user_id
         GROUP BY u.id, u.name, u.country
         ORDER BY total_recycled DESC
         LIMIT 10`
      );

      res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
      console.error('❌ Failed to fetch user leaderboard:', err.message);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });

  /**
   * 🌍 GET /api/leaderboard/countries
   * Returns top 10 countries based on total recycled quantity.
   */
  router.get('/leaderboard/countries', async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT u.country, COALESCE(SUM(r.quantity), 0)::INT AS total_recycled
         FROM users u
         JOIN recycling_logs r ON u.id = r.user_id
         GROUP BY u.country
         ORDER BY total_recycled DESC
         LIMIT 10`
      );

      res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
      console.error('❌ Failed to fetch country leaderboard:', err.message);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });

  return router;
};
