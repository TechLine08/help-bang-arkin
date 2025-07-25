// File: /api/auth.js (Vercel-compatible, Full CRUD + Fetch)

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
      // 🔍 Fetch user by ID
      try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [query.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        return res.status(200).json(result.rows[0]);
      } catch (err) {
        console.error('❌ Error fetching user by ID:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
    }

    // ✅ Ping route to confirm API is live
    return res.status(200).json({ message: '✅ Auth API is live and reachable!' });
  }

  if (method === 'POST') {
    // ✅ Register a new user
    const { nickname, country, marketing_opt_in = false } = body;
    if (!nickname || !country) {
      return res.status(400).json({ error: 'Nickname and country are required.' });
    }

    try {
      const insertQuery = `
        INSERT INTO users (nickname, country, marketing_opt_in)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      const values = [nickname, country, marketing_opt_in];
      const result = await pool.query(insertQuery, values);
      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('❌ Error inserting user:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (method === 'PUT') {
    // ✅ Update user profile
    const { id, nickname, country, avatar_url, marketing_opt_in } = body;
    if (!id) return res.status(400).json({ error: 'User ID is required.' });

    try {
      const updateQuery = `
        UPDATE users SET
          nickname = COALESCE($2, nickname),
          country = COALESCE($3, country),
          avatar_url = COALESCE($4, avatar_url),
          marketing_opt_in = COALESCE($5, marketing_opt_in)
        WHERE id = $1
        RETURNING *
      `;
      const values = [id, nickname, country, avatar_url, marketing_opt_in];
      const result = await pool.query(updateQuery, values);
      return res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error('❌ Error updating user:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (method === 'DELETE') {
    // ❌ Delete user
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