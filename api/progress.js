require('dotenv').config();
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

let pool;
try {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
} catch (err) {
  console.error('❌ DB connection init failed:', err);
}

module.exports = async (req, res) => {
  const method = req.method;
  console.log(`📡 /api/progress triggered with method: ${method}`);

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (method === 'OPTIONS') return res.status(200).end();

  try {
    switch (method) {
      case 'GET': {
        const { user_id } = req.query;
        console.log('🔍 GET progress', user_id ? `for user_id: ${user_id}` : 'for all users');

        let result;
        if (user_id) {
          result = await pool.query(`
            SELECT * FROM recycling_logs
            WHERE user_id = $1
            ORDER BY recycled_at DESC
          `, [user_id]);
        } else {
          result = await pool.query(`
            SELECT * FROM recycling_logs
            ORDER BY recycled_at DESC
          `);
        }

        console.log('📤 Fetched rows:', result.rows.length);
        return res.status(200).json(result.rows);
      }

      case 'POST': {
        const {
          user_id,
          location_id,
          material_type = 'Other',
          bottle_count,
          weight_kg,
          points_awarded = 0,
          photo_url = null,
        } = req.body;

        if (!user_id || !location_id || bottle_count == null || weight_kg == null) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const result = await pool.query(
          `
          INSERT INTO recycling_logs (
            id, user_id, location_id, material_type,
            bottle_count, weight_kg, points_awarded,
            photo_url, recycled_at
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
          RETURNING *
          `,
          [
            uuidv4(),
            user_id,
            location_id,
            material_type,
            bottle_count,
            weight_kg,
            points_awarded,
            photo_url,
          ]
        );

        return res.status(201).json(result.rows[0]);
      }

      case 'DELETE': {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: 'Missing recycling log ID' });

        await pool.query('DELETE FROM recycling_logs WHERE id = $1', [id]);
        return res.status(200).json({ success: true });
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error('❌ API /progress error:', err.stack || err.message || err);
    return res.status(500).json({
      error: 'Internal server error',
      debug: err.message || err,
    });
  }
};
