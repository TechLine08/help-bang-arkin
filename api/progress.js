// File: /api/progress.js

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is missing');
}

let pool;
try {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
} catch (err) {
  console.error('❌ Failed to connect to DB:', err);
}

module.exports = async (req, res) => {
  if (!pool) return res.status(500).json({ error: 'Database connection not initialized' });

  const method = req.method;
  console.log(`📡 /api/progress triggered with method: ${method}`);
  console.log('🔐 DATABASE_URL exists:', !!process.env.DATABASE_URL);

  if (method === 'HEAD') return res.status(200).json({ ok: true });

  // CORS headers
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
          const query = `
            SELECT *
            FROM recycling_logs
            WHERE user_id = $1
            ORDER BY recycled_at DESC
          `;
          result = await pool.query(query, [user_id]);
        } else {
          const query = `
            SELECT *
            FROM recycling_logs
            ORDER BY recycled_at DESC
          `;
          result = await pool.query(query);
        }

        console.log('📤 Returning logs:', result.rows.length);
        console.log('📤 Logs payload:', JSON.stringify(result.rows, null, 2));
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

        console.log('➕ POST new recycling entry:', {
          user_id,
          location_id,
          material_type,
          bottle_count,
          weight_kg,
          points_awarded,
        });

        if (!user_id || !location_id || bottle_count == null || weight_kg == null) {
          console.warn('⚠️ Missing required fields');
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

        console.log('✅ Log inserted:', result.rows[0]);
        return res.status(201).json(result.rows[0]);
      }

      case 'DELETE': {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: 'Missing recycling log ID' });

        console.log(`🗑️ DELETE recycling log with id: ${id}`);
        await pool.query('DELETE FROM recycling_logs WHERE id = $1', [id]);
        return res.status(200).json({ success: true, message: 'Recycling log deleted' });
      }

      default:
        console.warn('❌ Unsupported method');
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error('❌ Error in /api/progress:', err.stack || err.message || err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};