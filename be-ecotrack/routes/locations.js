const express = require('express');

module.exports = (pool) => {
  const router = express.Router();

  console.log('📍 Locations route initialized');

  /**
   * 📍 GET /api/locations
   * Returns all recycling locations sorted by region and name.
   */
  router.get('/locations', async (req, res) => {
    try {
      const query = `
        SELECT id, name, address, region, latitude, longitude
        FROM locations
        ORDER BY region, name
      `;

      const result = await pool.query(query);
      res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
      console.error('❌ Error fetching locations:', err.message);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });

  return router;
};
