/**
 * Seeds one event and reservations for existing students so you can test
 * GET /api/admin/generateStudentDataExcel/downloadSheet/:eventId
 *
 * Run after seedStudents (or run full: npm run seed).
 * Standalone: node seeder/seedEventsAndReservations.js
 */
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const {
  sequelize,
  event,
  reservation,
  Student,
  User,
} = require('../src/models');

async function seedEventsAndReservations() {
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

    // --- 1) Ensure we have students (use existing or create a few) ---
    let students = await Student.findAll({
      include: [{ model: User, attributes: ['userId', 'email'] }],
      limit: 5,
    });

    if (students.length === 0) {
      const passwordHash = await bcrypt.hash('Password123!', 10);
      const usersPayload = [
        { email: 'excel-test-1@example.com' },
        { email: 'excel-test-2@example.com' },
        { email: 'excel-test-3@example.com' },
      ].map((u, i) => ({
        userId: uuidv4(),
        email: u.email,
        passwordHash,
        role: 'STUDENT',
      }));
      await User.bulkCreate(usersPayload);
      const createdUsers = await User.findAll({
        where: { email: usersPayload.map((u) => u.email) },
      });
      const studentsPayload = createdUsers.map((u, i) => ({
        userId: u.userId,
        fullName: `طالب تجربة ${i + 1}`,
        NameEn: `Test Student ${i + 1}`,
        Mobile: `0100000000${i + 1}`,
        StudyLan: i % 2 === 0 ? 'AR' : 'EN',
        nationalId: `2990101010100${i + 1}`,
        status: 'approved',
      }));
      await Student.bulkCreate(studentsPayload);
      students = await Student.findAll({
        include: [{ model: User, attributes: ['userId', 'email'] }],
      });
    }

    if (students.length === 0) {
      console.log('⚠️ No students in DB. Run seedStudents first (or seed full pipeline).');
      return;
    }

    // --- 2) Create one event for Excel testing ---
    const eventId = uuidv4();
    const eventName = 'TPIT منح تدريبية 2025';
    const [eventRow, created] = await event.findOrCreate({
      where: { eventName },
      defaults: {
        eventId,
        eventName,
        packageId: null,
        productId: null,
        startDate,
        endDate,
        startDateRes,
        endDateRes,
        capacity: 100,
        numberOfRegistered: 0,
        status: 'opend',
        type: 'training',
        language: 'AR',
      },
    });

    const targetEventId = eventRow.eventId;
    if (created) {
      console.log('✅ Created event:', eventRow.eventName, '| eventId:', targetEventId);
    } else {
      console.log('✅ Using existing event:', eventRow.eventName, '| eventId:', targetEventId);
    }

    // --- 3) Create reservations (link students to this event) ---
    const existingRes = await reservation.findAll({
      where: { eventId: targetEventId },
      attributes: ['userId'],
    });
    const existingUserIds = new Set(existingRes.map((r) => r.userId.toString()));
    const toCreate = students.filter((s) => !existingUserIds.has(s.userId.toString()));

    if (toCreate.length > 0) {
      await reservation.bulkCreate(
        toCreate.map((s) => ({
          userId: s.userId,
          eventId: targetEventId,
        }))
      );
      await eventRow.increment('numberOfRegistered', { by: toCreate.length });
      console.log('✅ Created', toCreate.length, 'reservations for event', targetEventId);
    } else {
      console.log('✅ Reservations for this event already exist.');
    }

    console.log('\n📥 Test Excel download in Postman:');
    console.log('   GET http://localhost:3000/api/admin/generateStudentDataExcel/downloadSheet/' + targetEventId);
    console.log('   Header: Authorization: Bearer <your_admin_token>\n');
    return { eventId: targetEventId, eventName: eventRow.eventName };
  } catch (err) {
    console.error('❌ seedEventsAndReservations error:', err);
    throw err;
  }
}

if (require.main === module) {
  seedEventsAndReservations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seedEventsAndReservations;
