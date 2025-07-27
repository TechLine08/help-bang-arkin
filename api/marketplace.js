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

// 🌐 CORS headers
const setCors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Set your domain in prod
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

module.exports = async (req, res) => {
  const method = req.method;
  setCors(res);
  console.log(`🛍️ /api/marketplace invoked with method: ${method}`);

  if (method === 'OPTIONS') {
    return res.status(200).end(); // Preflight response
  }

  if (!pool) {
    console.error('🔴 Pool not initialized');
    return res.status(500).json({ error: 'DB not initialized' });
  }

  try {
    // === GET: List all non-expired vouchers ===
    if (method === 'GET') {
      console.log('📥 Fetching vouchers (non-expired only)...');
      const now = new Date().toISOString();

      const result = await pool.query(
        `SELECT * FROM vouchers
         WHERE expires_at IS NULL OR expires_at > $1
         ORDER BY created_at DESC`,
        [now]
      );

      console.log(`✅ Fetched ${result.rowCount} vouchers`);
      return res.status(200).json(result.rows);
    }

    // === POST: Create new voucher ===
    if (method === 'POST') {
      let body = req.body;

      try {
        if (typeof body === 'string') {
          body = JSON.parse(body);
        }
      } catch (err) {
        console.error('❌ Failed to parse request body:', err);
        return res.status(400).json({ error: 'Invalid JSON body' });
      }

      const { name, description, image_url, points_required, stock, expires_at } = body;
      console.log('📦 Creating voucher with:', { name, points_required, stock, expires_at });

      if (
        !name ||
        !description ||
        !image_url ||
        points_required == null ||
        stock == null
      ) {
        console.warn('⚠️ Missing required fields:', {
          name,
          description,
          image_url,
          points_required,
          stock,
        });
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const result = await pool.query(
        `INSERT INTO vouchers (name, description, image_url, points_required, stock, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [name, description, image_url, points_required, stock, expires_at || null]
      );

      console.log('✅ Voucher created:', result.rows[0]);
      return res.status(201).json(result.rows[0]);
    }

    // === Unsupported Method ===
    console.warn('🚫 Method not allowed:', method);
    return res.status(405).json({ error: 'Method not allowed' });

  } catch (err) {
    console.error('❌ Error in /api/marketplace:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
