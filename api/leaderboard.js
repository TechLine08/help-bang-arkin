// File: /api/leaderboard.js

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

module.exports = async (req, res) => {
  const { method } = req;
  const { scope = 'individual' } = req.query;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') return res.status(200).end();
  if (method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    if (scope === 'country') {
      const result = await pool.query(`
        SELECT country, total_points, total_bottles, total_weight
        FROM national_leaderboard
        WHERE period = 'all-time'
        ORDER BY total_weight DESC
        LIMIT 10;
      `);

      return res.status(200).json(result.rows);
    }

    // default: individual leaderboard
    const result = await pool.query(`
      SELECT
        l.total_points,
        l.total_bottles,
        l.total_weight,
        u.id,
        u.name,
        u.country,
        u.avatar_url
      FROM leaderboard l
      JOIN users u ON l.user_id = u.id
      WHERE l.period = 'all-time'
      ORDER BY l.total_weight DESC
      LIMIT 10;
    `);

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching leaderboard:', err.stack || err.message || err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
