// File: /api/feedback.js

const { Pool } = require('pg');

// PostgreSQL Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

module.exports = async (req, res) => {
  const { method, body } = req;

  // ✅ Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') return res.status(200).end(); // CORS preflight

  // ✅ GET: Return all feedbacks
  if (method === 'GET') {
    try {
      const result = await pool.query('SELECT * FROM feedback ORDER BY created_at DESC');
      return res.status(200).json(result.rows);
    } catch (err) {
      console.error('❌ GET /api/feedback error:', err.message);
      return res.status(500).json({ error: 'Failed to fetch feedbacks' });
    }
  }

  // ✅ POST: Save feedback (name, email, message)
  if (method === 'POST') {
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Missing name, email, or message' });
    }

    try {
      await pool.query(
        `INSERT INTO feedback (name, email, message) VALUES ($1, $2, $3)`,
        [name, email, message]
      );
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('❌ POST /api/feedback error:', err.message);
      return res.status(500).json({ error: 'Failed to save feedback' });
    }
  }

  // ❌ Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
};
