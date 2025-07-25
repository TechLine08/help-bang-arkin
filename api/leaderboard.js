// File: /api/leaderboard.js

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = async (req, res) => {
  const method = req.method;
  const { scope = 'individual' } = req.query;
  console.log(`📊 /api/leaderboard requested with method: ${method}, scope: ${scope}`);

  if (method !== 'GET') {
    console.warn(`🚫 Method ${method} not allowed on /api/leaderboard`);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (scope === 'country') {
      const result = await pool.query(`
        SELECT u.country, SUM(p.bottle_count) AS total_bottles, SUM(p.weight_kg) AS total_weight
        FROM users u
        JOIN progress p ON u.id = p.user_id
        GROUP BY u.country
        ORDER BY total_bottles DESC
        LIMIT 10;
      `);

      console.log(`✅ Returned ${result.rows.length} rows for country leaderboard`);
      return res.status(200).json(result.rows);
    }

    // Default: individual leaderboard
    const result = await pool.query(`
      SELECT u.id, u.name, u.avatar_url, u.country,
             SUM(p.bottle_count) AS total_bottles,
             SUM(p.weight_kg) AS total_weight
      FROM users u
      JOIN progress p ON u.id = p.user_id
      GROUP BY u.id, u.name, u.avatar_url, u.country
      ORDER BY total_bottles DESC
      LIMIT 10;
    `);

    console.log(`✅ Returned ${result.rows.length} rows for individual leaderboard`);
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('❌ Error in /api/leaderboard:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
