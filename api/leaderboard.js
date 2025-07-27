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
    // 🌍 COUNTRY LEADERBOARD
    if (scope === 'country') {
      const result = await pool.query(`
        SELECT
          u.country,
          SUM(p.bottle_count) AS total_bottles,
          SUM(p.weight_kg) AS total_weight,
          json_object_agg(
            p.material_type,
            json_build_object(
              'count', p.total_count,
              'weight', p.total_weight
            )
          ) AS materials
        FROM users u
        LEFT JOIN (
          SELECT user_id, material_type,
                 SUM(bottle_count) AS total_count,
                 SUM(weight_kg) AS total_weight
          FROM progress
          GROUP BY user_id, material_type
        ) p ON u.id = p.user_id
        GROUP BY u.country
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
        SUM(p.total_count) AS total_bottles,
        SUM(p.total_weight) AS total_weight,
        json_object_agg(
          p.material_type,
          json_build_object(
            'count', p.total_count,
            'weight', p.total_weight
          )
        ) AS materials
      FROM users u
      LEFT JOIN (
        SELECT user_id, material_type,
               SUM(bottle_count) AS total_count,
               SUM(weight_kg) AS total_weight
        FROM progress
        GROUP BY user_id, material_type
      ) p ON u.id = p.user_id
      GROUP BY u.id, u.name, u.avatar_url, u.country
      ORDER BY total_weight DESC
      LIMIT 10;
    `);

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('❌ Error in /api/leaderboard:', err.stack || err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
