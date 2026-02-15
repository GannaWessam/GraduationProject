/**
 * Seeds one event with the given packageId.
 * Usage: node seeder/seedEventWithPackage.js
 */
const { sequelize, event } = require('../src/models');

const PACKAGE_ID = 'f94bb3dd-1321-4df2-95c8-c4ea8df11f0f';

async function seedEventWithPackage() {
  try {
    await sequelize.sync({ alter: false });

    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() + 7);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 3);
    const startDateRes = new Date(now);
    startDateRes.setDate(startDateRes.getDate() - 7);
    const endDateRes = new Date(startDate);
    endDateRes.setDate(endDateRes.getDate() + 1);

    const eventRow = await event.create({
      eventName: 'Event – Package ' + PACKAGE_ID.slice(0, 8),
      packageId: PACKAGE_ID,
      productId: null,
      startDate,
      endDate,
      startDateRes,
      endDateRes,
      capacity: 100,
      numberOfRegistered: 0,
      status: 'opend',
      type: 'exam',
      language: 'AR',
    });

    console.log('✅ Created event:', eventRow.eventName, '| eventId:', eventRow.eventId);
    console.log('   packageId:', eventRow.packageId);
    return eventRow;
  } catch (err) {
    console.error('❌ seedEventWithPackage error:', err);
    throw err;
  }
}

if (require.main === module) {
  seedEventWithPackage()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seedEventWithPackage;
