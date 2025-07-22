const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  /**
   * GET /api/locations
   * Returns all active recycling locations sorted by region and name.
   */
  router.get('/locations', async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT id, name, address, region, latitude, longitude
         FROM locations
         -- WHERE is_active = true -- Uncomment if you plan to soft-disable locations
         ORDER BY region, name`
      );

      res.status(200).json(result.rows);
    } catch (err) {
      console.error('❌ Error fetching locations:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  return router;
};
