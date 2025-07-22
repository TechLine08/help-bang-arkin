// 🏆 routes/leaderboard.js
const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  /**
   * 🧑‍🤝‍🧑 GET /api/leaderboard/users
   * Returns top 10 users based on total quantity recycled.
   */
  router.get('/leaderboard/users', async (req, res) => {
    try {
      const { rows } = await pool.query(
        `SELECT u.name, u.country, SUM(r.quantity)::INT AS total_recycled
         FROM users u
         JOIN recycling_logs r ON u.id = r.user_id
         GROUP BY u.id
         ORDER BY total_recycled DESC
         LIMIT 10`
      );
      res.json(rows);
    } catch (err) {
      console.error('❌ Failed to fetch user leaderboard:', err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  /**
   * 🌍 GET /api/leaderboard/countries
   * Returns top 10 countries by recycling volume.
   */
  router.get('/leaderboard/countries', async (req, res) => {
    try {
      const { rows } = await pool.query(
        `SELECT u.country, SUM(r.quantity)::INT AS total_recycled
         FROM users u
         JOIN recycling_logs r ON u.id = r.user_id
         GROUP BY u.country
         ORDER BY total_recycled DESC
         LIMIT 10`
      );
      res.json(rows);
    } catch (err) {
      console.error('❌ Failed to fetch country leaderboard:', err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  return router;
};
