require('dotenv').config();
console.log('🌱 Starting full seed...');

(async () => {
  try {
    await require('./locationsSeed')();
    await require('./vouchersSeed')(); // Only if vouchersSeed.js exists
    console.log('🎉 Seeding complete.');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
})();
