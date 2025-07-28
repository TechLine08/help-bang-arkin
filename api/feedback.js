// File: /api/feedback.js

const { Pool } = require('pg');

// ✅ PostgreSQL Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ✅ CORS Middleware
const allowCors = (handler) => async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Use frontend domain in prod
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  return handler(req, res);
};

// ✅ Main Handler
const handler = async (req, res) => {
  const { method, body, query } = req;

  // ✅ GET: Fetch all feedbacks (Admin)
  if (method === 'GET') {
    try {
      const result = await pool.query(
        'SELECT * FROM eco_feedback ORDER BY created_at DESC'
      );
      return res.status(200).json(result.rows);
    } catch (err) {
      console.error('❌ GET /api/feedback error:', err.message);
      return res.status(500).json({ error: 'Failed to fetch feedbacks' });
    }
  }

  // ✅ POST: Submit new feedback (User)
  if (method === 'POST') {
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Missing name, email, or message' });
    }

    try {
      const result = await pool.query(
        'INSERT INTO eco_feedback (name, email, message) VALUES ($1, $2, $3) RETURNING *',
        [name, email, message]
      );
      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('❌ POST /api/feedback error:', err.message);
      return res.status(500).json({ error: 'Failed to submit feedback' });
    }
  }

  // ✅ DELETE: Remove feedback by ID (Admin)
  if (method === 'DELETE') {
    const { id } = query;

    if (!id) return res.status(400).json({ error: 'Missing feedback ID' });

    try {
      await pool.query('DELETE FROM eco_feedback WHERE id = $1', [id]);
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('❌ DELETE /api/feedback error:', err.message);
      return res.status(500).json({ error: 'Failed to delete feedback' });
    }
  }

  // ❌ Unsupported Method
  return res.status(405).json({ error: 'Method not allowed' });
};

module.exports = allowCors(handler);
