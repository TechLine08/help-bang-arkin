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

  // 🌐 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') return res.status(200).end();
  if (method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // 🌍 COUNTRY LEADERBOARD
    if (scope === 'country') {
      const result = await pool.query(`
        SELECT
          country,
          total_weight,
          materials,
          updated_at
        FROM national_leaderboard
        ORDER BY total_weight DESC
        LIMIT 10;
      `);

      return res.status(200).json(result.rows);
    }

    // 👤 INDIVIDUAL LEADERBOARD
    const result = await pool.query(`
      SELECT
        u.id,
        u.name,
        u.avatar_url,
        u.country,
        l.total_weight,
        l.materials,
        l.updated_at
      FROM leaderboard l
      JOIN users u ON l.user_id = u.id
      ORDER BY l.total_weight DESC
      LIMIT 10;
    `);

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('❌ Error in /api/leaderboard:', err.stack || err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
