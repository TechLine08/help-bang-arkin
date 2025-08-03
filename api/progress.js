
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

// === ✅ Check DB connection string ===
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is missing');
}

// === ✅ Create PostgreSQL pool ===
let pool;
try {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  console.log('✅ PostgreSQL pool created');
} catch (err) {
  console.error('❌ Failed to initialize PostgreSQL pool:', err);
}

module.exports = async (req, res) => {
  const method = req.method;
  console.log(`📡 /api/progress triggered [${method}]`);

  // === ✅ CORS Support ===
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (method === 'OPTIONS') return res.status(200).end();

  if (!pool) {
    console.error('❌ PostgreSQL pool is not initialized');
    return res.status(500).json({ error: 'Database connection not available' });
  }

  try {
    switch (method) {
      // === ✅ GET: Fetch user logs ===
      case 'GET': {
        const { user_id } = req.query;

        if (!user_id) {
          console.warn('⚠️ GET /progress missing user_id');
          return res.status(400).json({ error: 'Missing user_id in query' });
        }

        try {
          const result = await pool.query(
            `SELECT * FROM recycling_logs WHERE user_id = $1 ORDER BY recycled_at DESC`,
            [user_id]
          );

          console.log(`✅ Retrieved ${result.rowCount} logs for user_id: ${user_id}`);
          return res.status(200).json(result.rows);
        } catch (err) {
          console.error('❌ Error querying recycling_logs:', err);
          return res.status(500).json({ error: 'Failed to fetch logs', detail: err.message });
        }
      }

      // === ✅ POST: Log a new recycling entry ===
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

        console.log('📥 POST /progress payload:', req.body);

        // === Validate required fields ===
        if (!user_id || !location_id || bottle_count == null || weight_kg == null) {
          console.warn('⚠️ POST /progress missing required fields');
          return res.status(400).json({ error: 'Missing required fields' });
        }

        // ✅ Whitelist allowed material types
        const allowedTypes = ['Plastic', 'Aluminum', 'Glass', 'Paper', 'Other'];
        const cleanMaterialType = allowedTypes.includes(material_type) ? material_type : 'Other';

        try {
          const insertQuery = `
            INSERT INTO recycling_logs (
              id, user_id, location_id, material_type,
              bottle_count, weight_kg, points_awarded,
              photo_url, recycled_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
            RETURNING *
          `;

          const values = [
            uuidv4(),
            user_id,
            location_id,
            cleanMaterialType,
            parseInt(bottle_count),
            parseFloat(weight_kg),
            parseInt(points_awarded),
            photo_url,
          ];

          const result = await pool.query(insertQuery, values);
          console.log('✅ Inserted new recycling log:', result.rows[0]);

          return res.status(201).json(result.rows[0]);
        } catch (err) {
          console.error('❌ Error inserting recycling log:', err);
          return res.status(500).json({ error: 'Failed to insert log', detail: err.message });
        }
      }

      // === ❌ Unsupported method ===
      default:
        console.warn(`❌ Method not allowed: ${method}`);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error('❌ Server error in /api/progress:', err.stack || err.message);
    return res.status(500).json({
      error: 'Internal server error',
      details: err.message || 'Something went wrong',
    });
  }
};