// File: /api/leaderboard.js

require('dotenv').config();
const { Pool } = require('pg');

// 🛡️ Initialize DB connection pool
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
    // =====================================
    // 🌍 NATIONAL LEADERBOARD (by country)
    // =====================================
    if (scope === 'country') {
      const result = await pool.query(`
        SELECT
          u.country,
          COALESCE(SUM(r.weight_kg), 0) AS total_weight,
          COALESCE(
            JSON_OBJECT_AGG(
              r.material_type,
              JSON_BUILD_OBJECT(
                'count', SUM(r.bottle_count),
                'weight', SUM(r.weight_kg)
              )
            ) FILTER (WHERE r.material_type IS NOT NULL), '{}'
          ) AS materials
        FROM users u
        LEFT JOIN recycling_logs r ON u.id = r.user_id
        GROUP BY u.country
        ORDER BY total_weight DESC
        LIMIT 10;
      `);

      console.log(`✅ Returned ${result.rows.length} country leaderboard rows`);
      return res.status(200).json(result.rows);
    }

    // =====================================
    // 👤 INDIVIDUAL LEADERBOARD (by user)
    // =====================================
    const result = await pool.query(`
      SELECT
        u.id,
        u.name,
        u.avatar_url,
        u.country,
        COALESCE(SUM(r.weight_kg), 0) AS total_weight,
        COALESCE(
          JSON_OBJECT_AGG(
            r.material_type,
            JSON_BUILD_OBJECT(
              'count', SUM(r.bottle_count),
              'weight', SUM(r.weight_kg)
            )
          ) FILTER (WHERE r.material_type IS NOT NULL), '{}'
        ) AS materials
      FROM users u
      LEFT JOIN recycling_logs r ON u.id = r.user_id
      GROUP BY u.id, u.name, u.avatar_url, u.country
      ORDER BY total_weight DESC
      LIMIT 10;
    `);

    console.log(`✅ Returned ${result.rows.length} individual leaderboard rows`);
    return res.status(200).json(result.rows);

  } catch (err) {
    console.error('❌ Error in /api/leaderboard:', err.stack || err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
