/**
 * Seed studentCourse table: link all students from seedtestExcel to all courses from seedcourses.
 * Idempotent: safe to run multiple times (uses findOrCreate, won't create duplicates).
 * Usage: node seeder/seedStudentCourse.js
 */
require("dotenv").config();
const { sequelize, Student, course, studentCourse, User } = require("../src/models");
const { Op } = require("sequelize");

async function seedStudentCourse() {
  try {
    await sequelize.authenticate();
    console.log("DB Connected...");

    // 1️⃣ Get all students created by seedtestExcel (by email pattern)
    const users = await User.findAll({
      where: {
        email: {
          [Op.like]: "student%@test.com",
        },
      },
      attributes: ["userId", "email"],
    });

    if (users.length === 0) {
      console.log("⚠️ No students found (run seedtestExcel.js first)");
      return;
    }

    const userIds = users.map((u) => u.userId);
    const students = await Student.findAll({
      where: { userId: userIds },
      attributes: ["userId"],
    });

    if (students.length === 0) {
      console.log("⚠️ No students found (run seedtestExcel.js first)");
      return;
    }
    console.log(`Found ${students.length} students`);

    // 2️⃣ Get all courses created by seedcourses (by title pattern)
    const courses = await course.findAll({
      where: {
        title: {
          [Op.like]: "Quiz: %V3 (Real)",
        },
      },
      attributes: ["courseId", "title"],
    });

    if (courses.length === 0) {
      console.log("⚠️ No courses found (run seedcourses.js first)");
      return;
    }
    console.log(`Found ${courses.length} courses`);

    // 3️⃣ Get existing studentCourse links to avoid duplicates
    const existingLinks = await studentCourse.findAll({
      attributes: ["userId", "courseId"],
      raw: true,
    });
    const existingSet = new Set(
      existingLinks.map((sc) => `${sc.userId}|${sc.courseId}`)
    );

    // 4️⃣ Create studentCourse links (one per student per course)
    const linksToCreate = [];
    for (const student of students) {
      for (const c of courses) {
        const key = `${student.userId}|${c.courseId}`;
        if (!existingSet.has(key)) {
          linksToCreate.push({
            userId: student.userId,
            courseId: c.courseId,
            examStatus: null,
            trainingStatus: null,
          });
        }
      }
    }

    if (linksToCreate.length === 0) {
      console.log("✅ All student-course links already exist");
      return;
    }

    // Bulk create (idempotent: ignoreDuplicates handles race conditions)
    await studentCourse.bulkCreate(linksToCreate, {
      ignoreDuplicates: true,
    });

    console.log(`✅ Created ${linksToCreate.length} student-course links`);
    console.log(
      `   (${students.length} students × ${courses.length} courses = ${students.length * courses.length} total possible links)`
    );
  } catch (err) {
    console.error("❌", err);
    throw err;
  } finally {
    await sequelize.close();
  }
}

seedStudentCourse()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
