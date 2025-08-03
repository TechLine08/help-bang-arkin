// File: /api/tips.js

const { Pool } = require('pg');

// ✅ PostgreSQL Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ✅ Main Handler
const handler = async (req, res) => {
  const { method, query, body } = req;

  // ✅ Allow Preflight CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    return res.status(200).end(); // 🔥 Very important for preflight!
  }

  // ✅ GET: Fetch all tips
  if (method === 'GET') {
    try {
      const result = await pool.query('SELECT * FROM eco_tips ORDER BY created_at DESC');
      return res.status(200).json(result.rows);
    } catch (err) {
      console.error('❌ GET /api/tips error:', err.message);
      return res.status(500).json({ error: 'Failed to fetch tips', details: err.message });
    }
  }

  // ✅ POST: Add new tip
  if (method === 'POST') {
    const parsed = typeof body === 'string' ? JSON.parse(body) : body;
    const { title, content } = parsed;

    if (!title || !content) {
      return res.status(400).json({ error: 'Missing title or content' });
    }

    try {
      const result = await pool.query(
        'INSERT INTO eco_tips (title, content, created_at) VALUES ($1, $2, NOW()) RETURNING *',
        [title, content]
      );
      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('❌ POST /api/tips error:', err.message);
      return res.status(500).json({ error: 'Failed to add tip', details: err.message });
    }
  }

  // ✅ DELETE: Delete tip by ID
  if (method === 'DELETE') {
    const { id } = query;

    if (!id) {
      return res.status(400).json({ error: 'Missing tip ID' });
    }

    try {
      await pool.query('DELETE FROM eco_tips WHERE id = $1', [id]);
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('❌ DELETE /api/tips error:', err.message);
      return res.status(500).json({ error: 'Failed to delete tip', details: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};

module.exports = handler;
