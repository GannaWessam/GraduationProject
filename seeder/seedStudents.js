// run with : npm run seed:students
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const { sequelize, User, Student } = require('../src/models');

async function seedStudents() {
  try {
    await sequelize.sync();

    const plainPassword = 'Password123!';
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    const usersPayload = [
      { email: 'student1@example.com' },
      { email: 'student2@example.com' },
      { email: 'student3@example.com' },
      { email: 'student4@example.com' },
      { email: 'student5@example.com' },
    ].map((u) => ({
      userId: uuidv4(),
      email: u.email,
      passwordHash,
      role: 'STUDENT',
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // Upsert-like behavior: try create, ignore duplicates on email
    const createdUsers = await User.bulkCreate(usersPayload, {
      ignoreDuplicates: true,
      returning: true,
    });

    // Fetch actual persisted users (for id mapping) in case of duplicates
    const persistedUsers = await User.findAll({
      where: { email: usersPayload.map((u) => u.email) },
    });

    const emailToUser = new Map(persistedUsers.map((u) => [u.email, u]));

    const studentsPayload = [
      {
        email: 'student1@example.com',
        fullName: 'أحمد محمد',
        NameEn: 'Ahmed Mohamed',
        Mobile: '01000000001',
        StudyLan: 'AR',
        nationality: 'Egyptian',
        nationalId: '30101010101011',
        university: 'Helwan University',
        college: 'Faculty of Computers & AI',
        department: 'Computer Science',
        type: '1',
        status: 'approved',
      },
      {
        email: 'student2@example.com',
        fullName: 'سارة علي',
        NameEn: 'Sara Ali',
        Mobile: '01000000002',
        StudyLan: 'EN',
        nationality: 'Egyptian',
        nationalId: '30101010101012',
        university: 'Cairo University',
        college: 'Faculty of Engineering (Helwan)',
        department: 'Electronics',
        type: '2',
        status: 'approved',
      },
      {
        email: 'student3@example.com',
        fullName: 'محمد سمير',
        NameEn: 'Mohamed Samir',
        Mobile: '01000000003',
        StudyLan: 'EN',
        nationality: 'Egyptian',
        nationalId: '30101010101013',
        university: 'Ain Shams University',
        college: 'Faculty of Science',
        department: 'Mathematics',
        type: '3',
        status: 'pending',
      },
      {
        email: 'student4@example.com',
        fullName: 'مريم خالد',
        NameEn: 'Mariam Khaled',
        Mobile: '01000000004',
        StudyLan: 'AR',
        nationality: 'Egyptian',
        nationalId: '30101010101014',
        university: 'Alexandria University',
        college: 'Faculty of Pharmacy',
        department: 'Pharmaceutics',
        type: '4',
        status: 'approved',
      },
      {
        email: 'student5@example.com',
        fullName: 'يوسف حسن',
        NameEn: 'Youssef Hassan',
        Mobile: '01000000005',
        StudyLan: 'EN',
        nationality: 'Egyptian',
        nationalId: '30101010101015',
        university: 'Helwan University',
        college: 'Faculty of Commerce & Business Administration',
        department: 'Accounting',
        type: '1',
        status: 'approved',
      },
    ];

    // Check existing students by nationalId to avoid unique constraint violations
    const existingStudents = await Student.findAll({
      where: { nationalId: studentsPayload.map(s => s.nationalId) },
      attributes: ['nationalId', 'userId']
    });
    const existingNationalIds = new Set(existingStudents.map(s => s.nationalId));
    const existingUserIds = new Set(existingStudents.map(s => s.userId.toString()));

    const studentsToInsert = studentsPayload
      .filter(s => !existingNationalIds.has(s.nationalId))
      .map((s) => {
        const user = emailToUser.get(s.email);
        // Also check if user already has a student record
        if (existingUserIds.has(user.userId.toString())) {
          return null;
        }
        return {
          userId: user.userId,
          fullName: s.fullName,
          NameEn: s.NameEn,
          Mobile: s.Mobile,
          StudyLan: s.StudyLan,
          nationality: s.nationality,
          nationalId: s.nationalId,
          university: s.university,
          college: s.college,
          department: s.department,
          type: s.type,
          status: s.status,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      })
      .filter(s => s !== null);

    if (studentsToInsert.length > 0) {
      await Student.bulkCreate(studentsToInsert, { ignoreDuplicates: true });
      console.log(`✅ Seeded ${studentsToInsert.length} new students (${existingNationalIds.size} already existed)`);
    } else {
      console.log(`✅ All students already exist (${existingNationalIds.size} total)`);
    }

    console.log('✅ Seeded users and students successfully');
    console.log('➡️  You can log in with:');
    console.log('   email: student1@example.com  password: Password123!');
    return { success: true };
  } catch (error) {
    console.error('❌ Error seeding students:', error);
    throw error;
  }
}

module.exports = seedStudents;


