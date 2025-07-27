// File: /api/leaderboard.js

require('dotenv').config();
const { Pool } = require('pg');

// 🛡️ Initialize DB connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// 🚀 Main route handler
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
    // ============================
    // 🌍 Country Leaderboard
    // ============================
    if (scope === 'country') {
      const query = `
        SELECT
          u.country,
          COALESCE(
            json_object_agg(
              p.material_type,
              json_build_object(
                'count', SUM(p.bottle_count),
                'weight', SUM(p.weight_kg)
              )
            ) FILTER (WHERE p.material_type IS NOT NULL), '{}'
          ) AS materials,
          COALESCE(SUM(p.bottle_count), 0) AS total_bottles,
          COALESCE(SUM(p.weight_kg), 0) AS total_weight
        FROM users u
        LEFT JOIN progress p ON u.id = p.user_id
        GROUP BY u.country
        ORDER BY total_weight DESC
        LIMIT 10;
      `;

      const result = await pool.query(query);
      console.log(`✅ Returned ${result.rows.length} country leaderboard rows`);
      return res.status(200).json(result.rows);
    }

    // ============================
    // 👤 Individual Leaderboard
    // ============================
    const query = `
      SELECT
        u.id,
        u.name,
        u.avatar_url,
        u.country,
        COALESCE(
          json_object_agg(
            p.material_type,
            json_build_object(
              'count', SUM(p.bottle_count),
              'weight', SUM(p.weight_kg)
            )
          ) FILTER (WHERE p.material_type IS NOT NULL), '{}'
        ) AS materials,
        COALESCE(SUM(p.bottle_count), 0) AS total_bottles,
        COALESCE(SUM(p.weight_kg), 0) AS total_weight
      FROM users u
      LEFT JOIN progress p ON u.id = p.user_id
      GROUP BY u.id
      ORDER BY total_weight DESC
      LIMIT 10;
    `;

    const result = await pool.query(query);
    console.log(`✅ Returned ${result.rows.length} individual leaderboard rows`);
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('❌ Error in /api/leaderboard:', err.stack || err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
