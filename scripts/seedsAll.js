require('dotenv').config();
console.log('🌱 Starting full seed...');

(async () => {
  try {
    await require('./locationsSeed')();
    await require('./vouchersSeed')(); // Optional: if exists
    await require('./seed-users')();   // ✅ Added user seeding
    console.log('🎉 Seeding complete.');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
})();
