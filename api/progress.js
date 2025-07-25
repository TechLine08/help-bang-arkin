// File: /api/progress.js

require('dotenv').config();
const { Pool } = require('pg');

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

        if (user_id) {
          const result = await pool.query(
            'SELECT * FROM progress WHERE user_id = $1 ORDER BY timestamp DESC',
            [user_id]
          );
          return res.status(200).json(result.rows);
        } else {
          const result = await pool.query('SELECT * FROM progress ORDER BY timestamp DESC');
          return res.status(200).json(result.rows);
        }
      }

      case 'POST': {
        const { user_id, bottle_count, weight_kg } = req.body;
        console.log('➕ POST new progress entry:', { user_id, bottle_count, weight_kg });

        if (!user_id || bottle_count == null || weight_kg == null) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const result = await pool.query(
          `INSERT INTO progress (user_id, bottle_count, weight_kg)
           VALUES ($1, $2, $3) RETURNING *`,
          [user_id, bottle_count, weight_kg]
        );

        console.log('✅ Progress entry added:', result.rows[0]);
        return res.status(201).json(result.rows[0]);
      }

      case 'DELETE': {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: 'Missing progress ID' });

        console.log(`🗑️ DELETE progress entry with id: ${id}`);
        await pool.query('DELETE FROM progress WHERE id = $1', [id]);
        return res.status(200).json({ success: true, message: 'Progress deleted' });
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error('❌ Error in /api/progress:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};