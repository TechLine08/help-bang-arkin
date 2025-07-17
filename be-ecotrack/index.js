// 🌱 Load Environment Variables
require('dotenv').config();

// 📦 Dependencies
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

// 🚀 Setup Express App
const app = express();
const PORT = process.env.PORT || 5050;

// 🗄️ PostgreSQL Connection Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});

// 🔧 Middleware
app.use(cors());
app.use(express.json());

// 🩺 Health Check
app.get('/', (req, res) => {
  res.send('✅ EcoTrack Backend is Running!');
});


// 📬 Contact Form Submission
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO contact_messages (name, email, message)
       VALUES ($1, $2, $3) RETURNING *;`,
      [name, email, message]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('❌ Error saving contact message:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// 👤 Save New User After Sign Up
app.post('/api/users', async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO users (name, email)
       VALUES ($1, $2) RETURNING *;`,
      [name, email]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    // Handle duplicate email gracefully
    if (err.code === '23505') {
      return res.status(200).json({ success: true, message: 'User already exists.' });
    }
    console.error('❌ Error saving user:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// ♻️ Fetch Recycling Logs for a User
app.get('/api/recycling-logs', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Email is required.' });

  try {
    const userRes = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    const user = userRes.rows[0];

    if (!user) {
      console.warn(`No user found for email: ${email}`);
      return res.json([]);
    }

    const logsRes = await pool.query(
      `SELECT waste_type, quantity, timestamp
       FROM recycling_logs
       WHERE user_id = $1
       ORDER BY timestamp DESC;`,
      [user.id]
    );

    res.json(logsRes.rows);
  } catch (err) {
    console.error('❌ Error fetching logs:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// ♻️ Add a New Recycling Log
app.post('/api/recycling-logs', async (req, res) => {
  const { email, waste_type, quantity } = req.body;
  if (!email || !waste_type || !quantity || isNaN(quantity)) {
    return res.status(400).json({ error: 'Email, waste_type, and valid quantity are required.' });
  }

  try {
    const userRes = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    const user = userRes.rows[0];

    if (!user) {
      console.warn(`Submission failed — no user with email: ${email}`);
      return res.status(404).json({ error: 'User not found.' });
    }

    const result = await pool.query(
      `INSERT INTO recycling_logs (user_id, waste_type, quantity, timestamp)
       VALUES ($1, $2, $3, NOW()) RETURNING *;`,
      [user.id, waste_type, quantity]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('❌ Error inserting recycling log:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// 🚀 Start Server
app.listen(PORT, () => {
  console.log(`✅ EcoTrack Backend running at http://localhost:${PORT}`);
});
