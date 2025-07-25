// File: /api/locations.js (Vercel-compatible)

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = async (req, res) => {
  const method = req.method;

  if (method === 'GET') {
    // ✅ Fetch all locations
    try {
      const result = await pool.query('SELECT * FROM locations ORDER BY id ASC');
      return res.status(200).json(result.rows);
    } catch (err) {
      console.error('❌ Error fetching locations:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (method === 'POST') {
    // ✅ Add a new location
    const { name, latitude, longitude, radius = 100 } = req.body;
    if (!name || !latitude || !longitude) {
      return res.status(400).json({ error: 'Name, latitude, and longitude are required.' });
    }
    try {
      const insertQuery = `
        INSERT INTO locations (name, latitude, longitude, radius)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      const values = [name, latitude, longitude, radius];
      const result = await pool.query(insertQuery, values);
      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('❌ Error adding location:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (method === 'PUT') {
    // ✅ Update a location
    const { id, name, latitude, longitude, radius } = req.body;
    if (!id) return res.status(400).json({ error: 'Location ID is required.' });

    try {
      const updateQuery = `
        UPDATE locations SET
          name = COALESCE($2, name),
          latitude = COALESCE($3, latitude),
          longitude = COALESCE($4, longitude),
          radius = COALESCE($5, radius)
        WHERE id = $1
        RETURNING *
      `;
      const values = [id, name, latitude, longitude, radius];
      const result = await pool.query(updateQuery, values);
      return res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error('❌ Error updating location:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (method === 'DELETE') {
    // ✅ Delete a location
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Location ID is required in query.' });

    try {
      await pool.query('DELETE FROM locations WHERE id = $1', [id]);
      return res.status(200).json({ success: true, message: 'Location deleted.' });
    } catch (err) {
      console.error('❌ Error deleting location:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
