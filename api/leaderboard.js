// File: /api/leaderboard.js

require('dotenv').config();
const { Pool } = require('pg');

// 🛡️ Initialize DB pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// 🧠 Main handler
module.exports = async (req, res) => {
  const { method } = req;
  const { scope = 'individual' } = req.query;

  // 🌍 Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 🛑 Handle preflight
  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (method !== 'GET') {
    console.warn(`🚫 Method ${method} not allowed`);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (scope === 'country') {
      const countryQuery = `
        SELECT u.country,
               COALESCE(SUM(p.bottle_count), 0) AS total_bottles,
               COALESCE(SUM(p.weight_kg), 0) AS total_weight
        FROM users u
        LEFT JOIN progress p ON u.id = p.user_id
        GROUP BY u.country
        ORDER BY total_bottles DESC
        LIMIT 10;
      `;

      const result = await pool.query(countryQuery);
      console.log(`✅ Returned ${result.rows.length} country leaderboard rows`);
      return res.status(200).json(result.rows);
    }

    // Default: individual leaderboard
    const individualQuery = `
      SELECT u.id, u.name, u.avatar_url, u.country,
             COALESCE(SUM(p.bottle_count), 0) AS total_bottles,
             COALESCE(SUM(p.weight_kg), 0) AS total_weight
      FROM users u
      LEFT JOIN progress p ON u.id = p.user_id
      GROUP BY u.id, u.name, u.avatar_url, u.country
      ORDER BY total_bottles DESC
      LIMIT 10;
    `;

    const result = await pool.query(individualQuery);
    console.log(`✅ Returned ${result.rows.length} individual leaderboard rows`);
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching leaderboard:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
