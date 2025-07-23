require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});

const vouchers = [
  {
    title: '10% Off EcoMart',
    description: 'Get 10% off on your next EcoMart purchase.',
    points_required: 100,
    image_url: '/images/vouchers/ecomart.png',
  },
  {
    title: 'Free Reusable Bottle',
    description: 'Claim a free reusable bottle at your nearest center.',
    points_required: 200,
    image_url: '/images/vouchers/bottle.png',
  },
  {
    title: 'Grab Ride Credit $5',
    description: '$5 credit on your next Grab ride.',
    points_required: 150,
    image_url: '/images/vouchers/grab.png',
  },
];

const seedVouchers = async () => {
  try {
    console.log('🧹 Clearing existing vouchers...');
    await pool.query('DELETE FROM vouchers');

    for (const voucher of vouchers) {
      await pool.query(
        `INSERT INTO vouchers (title, description, points_required, image_url)
         VALUES ($1, $2, $3, $4)`,
        [voucher.title, voucher.description, voucher.points_required, voucher.image_url]
      );
      console.log(`✅ Inserted: ${voucher.title}`);
    }

    console.log('🎉 All vouchers seeded successfully.');
  } catch (err) {
    console.error('❌ Error during voucher seeding:', err);
  }
};

module.exports = async () => {
  try {
    await seedVouchers();
  } catch (err) {
    console.error('❌ Top-level error in voucher seeder:', err);
  } finally {
    await pool.end();
  }
};
