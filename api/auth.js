// File: /api/auth.js

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = async (req, res) => {
  const { method, query, body } = req;

  if (method === 'GET') {
    if (query.id) {
      try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [query.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        return res.status(200).json(result.rows[0]);
      } catch (err) {
        console.error('❌ Error fetching user by ID:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
    }

    return res.status(200).json({ message: '✅ Auth API is live and reachable!' });
  }

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

    try {
      const insertQuery = `
        INSERT INTO users (name, email, country, avatar_url, marketing_opt_in)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      const values = [name, email, country, avatar_url, marketing_opt_in];
      const result = await pool.query(insertQuery, values);
      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('❌ Error inserting user:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (method === 'PUT') {
    const {
      id,
      name,
      email,
      country,
      avatar_url,
      marketing_opt_in,
      last_tip_index,
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
          last_tip_index = COALESCE($7, last_tip_index)
        WHERE id = $1
        RETURNING *
      `;
      const values = [id, name, email, country, avatar_url, marketing_opt_in, last_tip_index];
      const result = await pool.query(updateQuery, values);
      return res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error('❌ Error updating user:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

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
