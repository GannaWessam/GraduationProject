/**
 * Ensure an event has exam rows for all 7 quiz courses (Quiz: X V3 (Real)).
 * Run with the same eventId you use for grade upload.
 * Usage: node scripts/ensureEventExams.js <eventId>
 */
require("dotenv").config();
const { sequelize, event, exam, course } = require("../src/models");

const QUIZ_COURSE_TITLES = [
  "Quiz: IT V3 (Real)",
  "Quiz: Word V3 (Real)",
  "Quiz: Powerpoint V3 (Real)",
  "Quiz: Database V3 (Real)",
  "Quiz: Web V3 (Real)",
  "Quiz: Mobile V3 (Real)",
  "Quiz: Excel V3 (Real)",
];

async function ensureEventExams(eventId) {
  if (!eventId) {
    console.error("Usage: node scripts/ensureEventExams.js <eventId>");
    process.exit(1);
  }

  await sequelize.authenticate();

  const eventRow = await event.findByPk(eventId);
  if (!eventRow) {
    console.error("Event not found:", eventId);
    process.exit(1);
  }

  const courses = await course.findAll({
    where: { title: QUIZ_COURSE_TITLES },
    attributes: ["courseId", "title"],
  });

  if (courses.length === 0) {
    console.error("No quiz courses found. Run: node seeder/seedcourses.js");
    process.exit(1);
  }

  const existingExams = await exam.findAll({
    where: { eventId },
    attributes: ["courseId"],
  });
  const existingCourseIds = new Set(existingExams.map((e) => e.courseId?.toString()));

  const examDate = new Date();
  examDate.setDate(examDate.getDate() + 14);

  let created = 0;
  for (const c of courses) {
    if (existingCourseIds.has(c.courseId?.toString())) continue;
    await exam.create({
      eventId,
      courseId: c.courseId,
      date: examDate,
      place: null,
      supervisorId: null,
    });
    created++;
    console.log("  + exam for", c.title);
  }

  if (created > 0) {
    console.log("✅ Created", created, "exam(s) for event", eventId);
  } else {
    console.log("✅ Event already has exams for all 7 courses.");
  }
  console.log("   Use this eventId when uploading grades:", eventId);
}

const eventId = process.argv[2]?.trim();
ensureEventExams(eventId)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => sequelize.close());
