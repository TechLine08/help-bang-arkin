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

  // 🌐 CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') return res.status(200).end();
  if (method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // 🗓 Get latest year and week_or_month from leaderboard table
    const meta = await pool.query(`
      SELECT year, week_or_month
      FROM leaderboard
      WHERE period = 'week'
      ORDER BY year DESC, week_or_month DESC
      LIMIT 1;
    `);

    if (meta.rowCount === 0) {
      return res.status(200).json([]); // no data available
    }

    const { year, week_or_month } = meta.rows[0];

    // ==============================
    // 🌍 Country leaderboard
    // ==============================
    if (scope === 'country') {
      const result = await pool.query(`
        SELECT country, total_points, total_bottles, total_weight
        FROM national_leaderboard
        WHERE period = 'week'
          AND year = $1
          AND week_or_month = $2
        ORDER BY total_weight DESC
        LIMIT 10;
      `, [year, week_or_month]);

      return res.status(200).json(result.rows);
    }

    // ==============================
    // 👤 Individual leaderboard
    // ==============================
    const result = await pool.query(`
      SELECT
        u.id,
        u.name,
        u.country,
        u.avatar_url,
        l.total_points,
        l.total_bottles,
        l.total_weight
      FROM leaderboard l
      JOIN users u ON l.user_id = u.id
      WHERE l.period = 'week'
        AND l.year = $1
        AND l.week_or_month = $2
      ORDER BY l.total_weight DESC
      LIMIT 10;
    `, [year, week_or_month]);

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('❌ Error in /api/leaderboard:', err.stack || err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
