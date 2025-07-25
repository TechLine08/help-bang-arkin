// api/locations.js
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const result = await pool.query(`
        SELECT id, name, address, region, latitude, longitude
        FROM locations
        ORDER BY region, name
      `);
      res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
      console.error('❌ Error fetching locations:', err.message);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
