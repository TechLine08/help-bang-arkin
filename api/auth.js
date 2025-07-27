const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

module.exports = async (req, res) => {
  const { method, query, body } = req;

  // === ✅ CORS headers ===
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') return res.status(200).end();

  console.log(`📥 [${method}] /api/auth`);

  // === ✅ GET: Fetch user by ID ===
  if (method === 'GET') {
    const { id } = query;
    if (id) {
      try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });

        const user = result.rows[0];
        delete user.password;
        return res.status(200).json(user);
      } catch (err) {
        console.error('❌ Error fetching user:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
    }

    return res.status(200).json({ message: '✅ Auth API is live!' });
  }

  // === ✅ POST: Login user ===
  if (method === 'POST' && body?.action === 'login') {
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

  // === ✅ POST: Register user ===
  if (method === 'POST') {
    const {
      name,
      email,
      country = null,
      password,
      avatar_url,
      marketing_opt_in = false,
    } = body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const role = email === 'orbital.ecotrack@gmail.com' ? 'admin' : 'user';
    const defaultAvatar = 'https://kqolfqxyiywlkintnoky.supabase.co/storage/v1/object/public/avatars/default.jpg';
    const finalAvatar = avatar_url || defaultAvatar;

    try {
      const existing = await pool.query('SELECT 1 FROM users WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'Email already registered.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const insertQuery = `
        INSERT INTO users (name, email, country, password, avatar_url, marketing_opt_in, role)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      const values = [name, email, country, hashedPassword, finalAvatar, marketing_opt_in, role];
      const result = await pool.query(insertQuery, values);

      const user = result.rows[0];
      delete user.password;
      return res.status(201).json(user);
    } catch (err) {
      console.error('❌ Error inserting user:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // === ✅ PUT: Update user ===
  if (method === 'PUT') {
    const {
      id,
      name,
      email,
      country,
      password,
      avatar_url,
      marketing_opt_in,
      last_tip_index,
      role,
    } = body;

    if (!id) return res.status(400).json({ error: 'User ID is required.' });

    try {
      let updateFields = [];
      let updateValues = [id];

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

      const updateQuery = `
        UPDATE users SET ${updateFields.join(', ')}
        WHERE id = $1
        RETURNING *
      `;

      const result = await pool.query(updateQuery, updateValues);
      const user = result.rows[0];
      delete user.password;
      return res.status(200).json(user);
    } catch (err) {
      console.error('❌ Error updating user:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // === ✅ DELETE: Remove user ===
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

  return res.status(405).json({ error: 'Method not allowed' });
};
