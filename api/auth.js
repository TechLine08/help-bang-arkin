const { Pool } = require('pg');
const bcrypt = require('bcrypt');

// ✅ PostgreSQL pool connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ✅ Main handler
module.exports = async (req, res) => {
  const { method, query, body, url } = req;

  // ✅ CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (method === 'OPTIONS') return res.status(200).end();

  console.log(`📥 [${method}] ${url}`);

  // =========================
  // 🔑 POST /api/auth/login
  // =========================
  if (method === 'POST' && url.includes('/login')) {
    const { email, password } = body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

      const user = result.rows[0];
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

      delete user.password;
      return res.status(200).json(user);
    } catch (err) {
      console.error('❌ Error logging in:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // =========================
  // 🔍 GET /api/auth?firebase_uid=xyz
  // =========================
  if (method === 'GET') {
    const { firebase_uid } = query;
    if (!firebase_uid) {
      return res.status(400).json({ error: 'firebase_uid is required' });
    }

    try {
      const result = await pool.query('SELECT * FROM users WHERE firebase_uid = $1', [firebase_uid]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });

      const user = result.rows[0];
      delete user.password;
      return res.status(200).json(user);
    } catch (err) {
      console.error('❌ Error fetching user:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // =========================
  // 🧑‍💻 POST /api/auth
  // Register new user
  // =========================
  if (method === 'POST') {
    const {
      name,
      email,
      password,
      firebase_uid,
      avatar_url,
      country = null,
      marketing_opt_in = false
    } = body;

    if (!name || !email || !password || !firebase_uid) {
      return res.status(400).json({ error: 'Name, email, password, and firebase_uid are required.' });
    }

    const role = email === 'orbital.ecotrack@gmail.com' ? 'admin' : 'user';
    const defaultAvatar = 'https://kqolfqxyiywlkintnoky.supabase.co/storage/v1/object/public/avatars/default.jpg';
    const finalAvatar = avatar_url || defaultAvatar;

    try {
      const existing = await pool.query(
        'SELECT 1 FROM users WHERE email = $1 OR firebase_uid = $2',
        [email, firebase_uid]
      );

      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'User already registered.' });
      }

      const hashed = await bcrypt.hash(password, 10);

      const insertQuery = `
        INSERT INTO users (firebase_uid, name, email, password, avatar_url, country, marketing_opt_in, role)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      const values = [firebase_uid, name, email, hashed, finalAvatar, country, marketing_opt_in, role];

      const result = await pool.query(insertQuery, values);
      const user = result.rows[0];
      delete user.password;
      return res.status(201).json(user);
    } catch (err) {
      console.error('❌ Error creating user:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // =========================
  // ✏️ PUT /api/auth
  // Update user by firebase_uid
  // =========================
  if (method === 'PUT') {
    const {
      firebase_uid,
      name,
      email,
      password,
      avatar_url,
      country,
      marketing_opt_in,
      last_tip_index,
      role,
    } = body;

    if (!firebase_uid) return res.status(400).json({ error: 'firebase_uid is required.' });

    try {
      const updateFields = [];
      const updateValues = [];

      if (name !== undefined) {
        updateValues.push(name);
        updateFields.push(`name = $${updateValues.length}`);
      }
      if (email !== undefined) {
        updateValues.push(email);
        updateFields.push(`email = $${updateValues.length}`);
      }
      if (country !== undefined) {
        updateValues.push(country);
        updateFields.push(`country = $${updateValues.length}`);
      }
      if (password !== undefined) {
        const hashed = await bcrypt.hash(password, 10);
        updateValues.push(hashed);
        updateFields.push(`password = $${updateValues.length}`);
      }
      if (avatar_url !== undefined) {
        updateValues.push(avatar_url);
        updateFields.push(`avatar_url = $${updateValues.length}`);
      }
      if (marketing_opt_in !== undefined) {
        updateValues.push(marketing_opt_in);
        updateFields.push(`marketing_opt_in = $${updateValues.length}`);
      }
      if (last_tip_index !== undefined) {
        updateValues.push(last_tip_index);
        updateFields.push(`last_tip_index = $${updateValues.length}`);
      }
      if (role !== undefined) {
        updateValues.push(role);
        updateFields.push(`role = $${updateValues.length}`);
      }

      updateValues.push(firebase_uid); // where clause

      const result = await pool.query(
        `UPDATE users SET ${updateFields.join(', ')} WHERE firebase_uid = $${updateValues.length} RETURNING *`,
        updateValues
      );

      const user = result.rows[0];
      delete user.password;
      return res.status(200).json(user);
    } catch (err) {
      console.error('❌ Error updating user:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // =========================
  // 🗑 DELETE /api/auth?firebase_uid=xyz
  // =========================
  if (method === 'DELETE') {
    const { firebase_uid } = query;
    if (!firebase_uid) return res.status(400).json({ error: 'firebase_uid is required' });

    try {
      await pool.query('DELETE FROM users WHERE firebase_uid = $1', [firebase_uid]);
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('❌ Error deleting user:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // =========================
  // ❌ Method Not Allowed
  // =========================
  return res.status(405).json({
    error: 'Method not allowed',
    message: 'Use GET with ?firebase_uid= or POST/PUT/DELETE with valid body.'
  });
};
