// File: /api/tips.js

const { Pool } = require('pg');

// PostgreSQL pool setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// === ✅ CORS Wrapper ===
const allowCors = (handler) => async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // In production, use your domain
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  return handler(req, res);
};

// === ✅ Main Handler ===
const handler = async (req, res) => {
  const { method } = req;

  if (method === 'GET') {
    try {
      const result = await pool.query('SELECT * FROM tips ORDER BY created_at DESC');
      return res.status(200).json(result.rows);
    } catch (err) {
      console.error('❌ GET tips error:', err);
      return res.status(500).json({ error: 'Failed to fetch tips' });
    }
  }

  if (method === 'POST') {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Missing title or content' });
    }

    try {
      const result = await pool.query(
        'INSERT INTO tips (title, content) VALUES ($1, $2) RETURNING *',
        [title, content]
      );
      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('❌ POST tip error:', err);
      return res.status(500).json({ error: 'Failed to add tip' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};

module.exports = allowCors(handler);
