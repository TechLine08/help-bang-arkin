// File: /api/marketplace.js

require('dotenv').config();
const { Pool } = require('pg');

console.log('🟡 [marketplace.js] Loaded');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = async (req, res) => {
  const method = req.method;
  console.log(`🛍️ /api/marketplace invoked with method: ${method}`);

  if (!pool) {
    console.error('🔴 Pool is not initialized');
    return res.status(500).json({ error: 'DB not initialized' });
  }

  try {
    // === GET: List vouchers ===
    if (method === 'GET') {
      console.log('📥 Fetching vouchers...');
      const result = await pool.query('SELECT * FROM vouchers ORDER BY created_at DESC');
      console.log(`✅ Fetched ${result.rowCount} vouchers`);
      return res.status(200).json(result.rows);
    }

    // === POST: Create new voucher ===
    if (method === 'POST') {
      let body = req.body;

      try {
        if (typeof body === 'string') {
          body = JSON.parse(body); // Fallback for raw JSON
        }
      } catch (err) {
        console.error('❌ Failed to parse request body:', err);
        return res.status(400).json({ error: 'Invalid JSON body' });
      }

      const { name, description, image_url, points_required } = body;
      console.log('📦 Creating voucher with:', { name, points_required });

      if (!name || !description || !image_url || points_required == null) {
        console.warn('⚠️ Missing required fields:', { name, description, image_url, points_required });
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const result = await pool.query(
        `INSERT INTO vouchers (name, description, image_url, points_required)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [name, description, image_url, points_required]
      );

      console.log('✅ Voucher created:', result.rows[0]);
      return res.status(201).json(result.rows[0]);
    }

    console.warn('🚫 Method not allowed:', method);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('❌ Error in /api/marketplace:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
