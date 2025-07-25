// File: scripts/seed-users.js

require('dotenv').config();
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const users = [
  {
    id: uuidv4(),
    name: 'Alice Tan',
    email: 'alice@example.com',
    country: 'Singapore',
    avatar_url: null,
    marketing_opt_in: true,
    last_tip_index: 0,
  },
  {
    id: uuidv4(),
    name: 'Budi Santoso',
    email: 'budi@example.com',
    country: 'Indonesia',
    avatar_url: null,
    marketing_opt_in: false,
    last_tip_index: 1,
  },
  {
    id: uuidv4(),
    name: 'Catherine Lim',
    email: 'catherine@example.com',
    country: 'Malaysia',
    avatar_url: null,
    marketing_opt_in: true,
    last_tip_index: 2,
  },
];

const seed = async () => {
  console.log('🌱 Seeding users...');
  try {
    for (const user of users) {
      await pool.query(
        `INSERT INTO users (id, name, email, country, avatar_url, marketing_opt_in, last_tip_index)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (email) DO NOTHING`,
        [
          user.id,
          user.name,
          user.email,
          user.country,
          user.avatar_url,
          user.marketing_opt_in,
          user.last_tip_index,
        ]
      );
      console.log(`✅ Inserted user: ${user.name}`);
    }
  } catch (err) {
    console.error('❌ Error seeding users:', err);
  } finally {
    await pool.end();
    console.log('🌱 Done seeding users.');
  }
};

// ✅ Export the function for require() call in seedsAll
module.exports = seed;
