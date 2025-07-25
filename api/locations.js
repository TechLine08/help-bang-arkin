const { Pool } = require('pg');

console.log('🟡 [locations.js] Loaded');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

module.exports = async (req, res) => {
  const method = req.method;
  console.log(`📥 [${method}] /api/locations hit`);

  if (!pool) {
    console.error('❌ No DB connection pool');
    return res.status(500).json({ error: 'DB not initialized' });
  }

  // GET — Fetch all locations
  if (method === 'GET') {
    try {
      const result = await pool.query('SELECT * FROM locations ORDER BY created_at DESC');
      console.log(`✅ Returned ${result.rowCount} rows`);
      return res.status(200).json(result.rows);
    } catch (err) {
      console.error('❌ Error in GET /api/locations:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // POST — Add a location
  if (method === 'POST') {
    let body = req.body;

    try {
      if (typeof req.body === 'string') {
        body = JSON.parse(req.body); // In case body is stringified JSON
      }
    } catch (e) {
      console.error('❌ Invalid JSON body:', e);
      return res.status(400).json({ error: 'Invalid JSON body' });
    }

    const { name, address, city, region, lat, lng } = body;

    if (!name || lat == null || lng == null) {
      console.warn('⚠️ Missing required fields:', { name, lat, lng });
      return res.status(400).json({ error: 'name, lat, and lng are required.' });
    }

    try {
      const result = await pool.query(
        `INSERT INTO locations (id, name, address, city, region, lat, lng, created_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW())
         RETURNING *`,
        [name, address || '', city || '', region || '', lat, lng]
      );
      console.log('✅ Inserted:', result.rows[0]);
      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('❌ Error inserting location:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Method not allowed
  console.warn('🚫 Method not allowed:', method);
  return res.status(405).json({ error: 'Method not allowed' });
};
