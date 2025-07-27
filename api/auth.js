// File: /api/auth.js

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

module.exports = async (req, res) => {
  const { method, query, body } = req;

  // === ✅ CORS headers ===
  res.setHeader('Access-Control-Allow-Origin', '*'); // Change to frontend domain in prod
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // === ✅ Preflight request ===
  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log(`📥 [${method}] /api/auth`);

  // === GET: Fetch user by ID or ping ===
  if (method === 'GET') {
    const { id } = query;

    if (id) {
      try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        return res.status(200).json(result.rows[0]);
      } catch (err) {
        console.error('❌ Error fetching user:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
    }

    return res.status(200).json({ message: '✅ Auth API is live!' });
  }

  // === POST: Register user ===
  if (method === 'POST') {
    const {
      name,
      email,
      country,
      avatar_url = null,
      marketing_opt_in = false,
    } = body;

    if (!name || !email || !country) {
      return res.status(400).json({ error: 'Name, email, and country are required.' });
    }

    const role = email === 'admin@example.com' ? 'admin' : 'user';

    try {
      const insertQuery = `
        INSERT INTO users (name, email, country, avatar_url, marketing_opt_in, role)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      const values = [name, email, country, avatar_url, marketing_opt_in, role];
      const result = await pool.query(insertQuery, values);
      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('❌ Error inserting user:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // === PUT: Update user ===
  if (method === 'PUT') {
    const {
      id,
      name,
      email,
      country,
      avatar_url,
      marketing_opt_in,
      last_tip_index,
      role,
    } = body;

    if (!id) return res.status(400).json({ error: 'User ID is required.' });

    try {
      const updateQuery = `
        UPDATE users SET
          name = COALESCE($2, name),
          email = COALESCE($3, email),
          country = COALESCE($4, country),
          avatar_url = COALESCE($5, avatar_url),
          marketing_opt_in = COALESCE($6, marketing_opt_in),
          last_tip_index = COALESCE($7, last_tip_index),
          role = COALESCE($8, role)
        WHERE id = $1
        RETURNING *
      `;
      const values = [id, name, email, country, avatar_url, marketing_opt_in, last_tip_index, role];
      const result = await pool.query(updateQuery, values);
      return res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error('❌ Error updating user:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // === DELETE: Remove user ===
  if (method === 'DELETE') {
    const { id } = query;
    if (!id) return res.status(400).json({ error: 'User ID is required.' });

    try {
      await pool.query('DELETE FROM users WHERE id = $1', [id]);
      return res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
      console.error('❌ Error deleting user:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // === Fallback ===
  return res.status(405).json({ error: 'Method not allowed' });
};
