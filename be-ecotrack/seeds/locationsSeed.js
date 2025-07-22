require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});

const seedLocations = async () => {
  const locations = [
    {
      name: 'Eco Hub Orchard',
      address: '238 Orchard Road, Singapore 238905',
      region: 'Central',
      latitude: 1.3039,
      longitude: 103.8318,
    },
    {
      name: 'Tampines Eco Point',
      address: '10 Tampines North Drive, Singapore 528553',
      region: 'East',
      latitude: 1.3611,
      longitude: 103.9452,
    },
    {
      name: 'Jurong Green Spot',
      address: '50 Jurong Gateway Rd, Singapore 608549',
      region: 'West',
      latitude: 1.3331,
      longitude: 103.7430,
    },
    {
      name: 'Woodlands Recycle Depot',
      address: '30 Woodlands Ave 2, Singapore 738343',
      region: 'North',
      latitude: 1.4376,
      longitude: 103.7865,
    },
    {
      name: 'Punggol Green Corner',
      address: '83 Punggol Central, Singapore 828761',
      region: 'Northeast',
      latitude: 1.4044,
      longitude: 103.9020,
    },
  ];

  for (const loc of locations) {
    await pool.query(
      `INSERT INTO locations (name, address, region, latitude, longitude)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT DO NOTHING;`,
      [loc.name, loc.address, loc.region, loc.latitude, loc.longitude]
    );
  }

  console.log('✅ Locations seeded successfully.');
};

module.exports = async () => {
  try {
    await seedLocations();
  } catch (err) {
    console.error('❌ Error seeding locations:', err);
  } finally {
    await pool.end();
  }
};
