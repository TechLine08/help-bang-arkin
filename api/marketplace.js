// File: /api/marketplace.js

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
  console.log(`🛍️ /api/marketplace invoked with method: ${method}`);

  try {
    if (method === 'GET') {
      const result = await pool.query('SELECT * FROM vouchers ORDER BY created_at DESC');
      console.log(`✅ Fetched ${result.rows.length} vouchers`);
      return res.status(200).json(result.rows);
    }

    if (method === 'POST') {
      const { name, description, image_url, points_required } = req.body;
      console.log('📦 Creating voucher with:', { name, points_required });

      if (!name || !description || !image_url || points_required == null) {
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

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('❌ Error in /api/marketplace:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
