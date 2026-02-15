const { sequelize, course, package, packageCourse } = require('../src/models'); // استيراد كل الموديلات
const { v4: uuidv4 } = require('uuid');

async function seedCoursesAndPackage() {
  try {
    // ----- 1️⃣ كورسات -----
    const courseTitles = [
      "Quiz: IT V3 (Real)",
      "Quiz: Word V3 (Real)",
      "Quiz: Powerpoint V3 (Real)",
      "Quiz: Database V3 (Real)",
      "Quiz: Web V3 (Real)",
      "Quiz: Mobile V3 (Real)",
      "Quiz: Excel V3 (Real)"
    ];

    const coursesPayload = courseTitles.map(title => ({
      name: title,
      title: title,
      priceEgyptian: 0,
      priceOther: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    const existingCourses = await course.findAll({
      where: { title: courseTitles },
      attributes: ['courseId', 'title']
    });

    const existingTitles = new Set(existingCourses.map(c => c.title));
    const coursesToInsert = coursesPayload.filter(c => !existingTitles.has(c.title));

    let allCourses;
    if (coursesToInsert.length > 0) {
      const createdCourses = await course.bulkCreate(coursesToInsert, { ignoreDuplicates: true, returning: true });
      console.log(`✅ Seeded ${createdCourses.length} new courses (${existingTitles.size} already existed)`);
      allCourses = [...existingCourses, ...createdCourses];
    } else {
      console.log(`✅ All courses already exist (${existingTitles.size} total)`);
      allCourses = existingCourses;
    }

    // ----- 2️⃣ انشاء باكج -----
    const packageName = "Starter Package";

    // تحقق لو الباكج موجود
    let pkg = await package.findOne({ where: { packageName } });
    if (!pkg) {
      pkg = await package.create({
        packageId: uuidv4(),
        packageName,
        size: allCourses.length, // حجم الباكج = عدد الكورسات
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`✅ Package "${packageName}" created`);
    } else {
      console.log(`✅ Package "${packageName}" already exists`);
    }

    // ----- 3️⃣ ربط الكورسات بالباكج -----
    const existingPackageCourses = await packageCourse.findAll({
      where: { packageId: pkg.packageId },
      attributes: ['courseId']
    });
    const existingCourseIds = new Set(existingPackageCourses.map(pc => pc.courseId));

    const packageCoursesToInsert = allCourses
      .filter(c => !existingCourseIds.has(c.courseId))
      .map(c => ({
        Id: uuidv4(),
        packageId: pkg.packageId,
        courseId: c.courseId,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

    if (packageCoursesToInsert.length > 0) {
      await packageCourse.bulkCreate(packageCoursesToInsert, { ignoreDuplicates: true });
      console.log(`✅ Linked ${packageCoursesToInsert.length} courses to package "${packageName}"`);
    } else {
      console.log(`✅ All courses already linked to package "${packageName}"`);
    }

    console.log('✅ Seeding completed successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Error seeding courses and package:', error);
    throw error;
  }
}

module.exports = seedCoursesAndPackage;

// لو حابب تشغله مباشر:
if (require.main === module) {
  seedCoursesAndPackage().catch(() => process.exit(1));
}