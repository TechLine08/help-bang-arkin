const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  /**
   * 📍 GET /api/locations
   * Returns all (active) recycling locations sorted by region and name.
   */
  router.get('/locations', async (req, res) => {
    try {
      const query = `
        SELECT id, name, address, region, latitude, longitude
        FROM locations
        -- WHERE is_active = true -- Uncomment this line if using soft-deletion
        ORDER BY region, name
      `;

      const { rows } = await pool.query(query);

      res.status(200).json({ success: true, data: rows });
    } catch (err) {
      console.error('❌ Error fetching locations:', err);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });

  return router;
};
