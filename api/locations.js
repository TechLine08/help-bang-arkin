const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

module.exports = async (req, res) => {
  const method = req.method;

  if (method === 'GET') {
    try {
      const result = await pool.query('SELECT * FROM locations ORDER BY created_at DESC');
      return res.status(200).json(result.rows);
    } catch (err) {
      console.error('❌ GET error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (method === 'POST') {
    const { name, address, city, region, lat, lng } = req.body;
    if (!name || !lat || !lng) {
      return res.status(400).json({ error: 'Name, lat, and lng are required.' });
    }

    try {
      const insertQuery = `
        INSERT INTO locations (name, address, city, region, lat, lng)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      const values = [name, address || '', city || '', region || '', lat, lng];
      const result = await pool.query(insertQuery, values);
      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('❌ POST error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
