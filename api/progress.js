// File: /api/progress.js

require('dotenv').config();
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = async (req, res) => {
  const method = req.method;
  console.log(`📡 /api/progress triggered with method: ${method}`);

  try {
    switch (method) {
      case 'GET': {
        const { user_id } = req.query;
        console.log('🔍 GET progress', user_id ? `for user_id: ${user_id}` : 'for all users');

        const baseQuery = `
          SELECT *
          FROM recycling_logs
          ${user_id ? 'WHERE user_id = $1' : ''}
          ORDER BY recycled_at DESC
        `;

        const result = user_id
          ? await pool.query(baseQuery, [user_id])
          : await pool.query(baseQuery);

        return res.status(200).json(result.rows);
      }

      case 'POST': {
        const {
          user_id,
          location_id,
          material_type = 'Other', // fallback if frontend not ready
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

        console.log('✅ Recycling log added:', result.rows[0]);
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
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error('❌ Error in /api/progress:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
