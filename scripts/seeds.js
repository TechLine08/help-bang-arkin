const seedVouchers = require('./vouchersSeed');
const seedLocations = require('./locationsSeed');

(async () => {
  try {
    console.log('🌱 Seeding Vouchers...');
    await seedVouchers();

    console.log('🌱 Seeding Locations...');
    await seedLocations();

    console.log('✅ All seeds completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
})();
