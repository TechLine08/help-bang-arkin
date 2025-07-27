require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});

// 🎯 Seed data
const vouchers = [
  {
    title: '10% Off EcoMart',
    description: 'Get 10% off on your next EcoMart purchase.',
    points_required: 100,
    image_url: '/images/vouchers/ecomart.png',
    stock: 50,
    expires_at: '2025-12-31T23:59:59Z',
  },
  {
    title: 'Free Reusable Bottle',
    description: 'Claim a free reusable bottle at your nearest center.',
    points_required: 200,
    image_url: '/images/vouchers/bottle.png',
    stock: 30,
    expires_at: '2025-11-30T23:59:59Z',
  },
  {
    title: 'Grab Ride Credit $5',
    description: '$5 credit on your next Grab ride.',
    points_required: 150,
    image_url: '/images/vouchers/grab.png',
    stock: 75,
    expires_at: '2025-10-31T23:59:59Z',
  },
];

const seedVouchers = async () => {
  try {
    console.log('🧹 Clearing existing vouchers...');
    await pool.query('DELETE FROM vouchers');

    for (const voucher of vouchers) {
      await pool.query(
        `INSERT INTO vouchers (title, description, points_required, image_url, stock, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          voucher.title,
          voucher.description,
          voucher.points_required,
          voucher.image_url,
          voucher.stock,
          voucher.expires_at,
        ]
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
