require('dotenv').config();
console.log('🌱 Starting full seed...');

// Load seed modules
const seedUsers = require('./seed-users');
const seedLocations = require('./locationsSeed');
const seedVouchers = require('./vouchersSeed');     // Optional: skip if not created
const seedProgress = require('./seed-progress');    // Depends on users

(async () => {
  try {
    // 1. Seed users first (so others can reference them)
    await seedUsers();

    // 2. Seed locations
    await seedLocations();

    // 3. Seed vouchers (if file exists and exported correctly)
    if (typeof seedVouchers === 'function') {
      await seedVouchers();
    }

    // 4. Seed recycling logs (must run after users)
    await seedProgress();

    console.log('🎉 Seeding complete.');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
})();
