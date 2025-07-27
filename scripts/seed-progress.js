// scripts/seed-progress.js
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// 🚮 Logs to seed
const logs = [
  {
    id: 'e1111111-aaaa-bbbb-cccc-111111111111',
    user_email: 'alice@example.com',
    location_name: 'Eco Hub Orchard',
    material_type: 'Plastic',
    bottle_count: 10,
    weight_kg: 1.25,
    points_awarded: 25,
    photo_url: 'https://example.com/photo1.jpg',
    recycled_at: new Date(),
  },
  {
    id: 'e2222222-aaaa-bbbb-cccc-222222222222',
    user_email: 'budi@example.com',
    location_name: 'Tampines Eco Point',
    material_type: 'Aluminum',
    bottle_count: 5,
    weight_kg: 0.8,
    points_awarded: 15,
    photo_url: 'https://example.com/photo2.jpg',
    recycled_at: new Date(),
  },
];

const seed = async () => {
  console.log('🌱 Seeding recycling_logs...');
  try {
    for (const log of logs) {
      console.log(`🔍 Seeding log: ${log.id} (${log.user_email}, ${log.location_name})`);

      // 🧑 Get user_id from email
      const userRes = await pool.query(`SELECT id FROM users WHERE email = $1`, [log.user_email]);
      const user = userRes.rows[0];
      if (!user) {
        console.warn(`⚠️ No user found for ${log.user_email}`);
        continue;
      }

      // 📍 Get location_id from name
      const locRes = await pool.query(`SELECT id FROM locations WHERE name = $1`, [log.location_name]);
      const location = locRes.rows[0];
      if (!location) {
        console.warn(`⚠️ No location found for "${log.location_name}"`);
        continue;
      }

      // ✅ Insert into recycling_logs
      const insertRes = await pool.query(
        `
        INSERT INTO recycling_logs (
          id, user_id, location_id, material_type,
          bottle_count, weight_kg, points_awarded,
          photo_url, recycled_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        ON CONFLICT (id) DO NOTHING
        `,
        [
          log.id,
          user.id,
          location.id,
          log.material_type,
          log.bottle_count,
          log.weight_kg,
          log.points_awarded,
          log.photo_url,
          log.recycled_at,
        ]
      );

      console.log(`✅ Inserted: ${log.user_email} ➜ ${log.material_type} @ ${log.location_name}`);
    }

    console.log('🌱 Done seeding recycling_logs.');
  } catch (err) {
    console.error('❌ Error seeding recycling_logs:', err.stack || err.message);
    throw err;
  } finally {
    await pool.end();
    console.log('🔌 DB connection closed.');
  }
};

module.exports = seed;
