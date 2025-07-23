require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});

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

const seedLocations = async () => {
  for (const loc of locations) {
    try {
      await pool.query(
        `INSERT INTO locations (name, address, region, latitude, longitude)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (name) DO NOTHING;`,
        [loc.name, loc.address, loc.region, loc.latitude, loc.longitude]
      );
      console.log(`✅ Inserted or skipped: ${loc.name}`);
    } catch (err) {
      console.error(`❌ Error inserting ${loc.name}:`, err.message);
    }
  }
};

module.exports = async () => {
  try {
    console.log('🌍 Seeding locations...');
    await seedLocations();
    console.log('🎉 All locations processed.');
  } catch (err) {
    console.error('❌ Unexpected error during seeding:', err);
  } finally {
    await pool.end();
  }
};
