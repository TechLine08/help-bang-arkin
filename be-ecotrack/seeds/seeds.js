const seedVouchers = require('./vouchersSeed');
const seedLocations = require('./locationsSeed');

(async () => {
  try {
    console.log('🌱 Seeding Vouchers...');
    await seedVouchers();

    console.log('🌱 Seeding Locations...');
    await seedLocations();

    console.log('✅ All seeds done!');
    process.exit();
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
})();
