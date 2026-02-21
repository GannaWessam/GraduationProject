const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const reserve = require("../src/modules/user/reserveEvents/reservationService");
const nationalIds = [
"30301121603084",
"29712151801829",
"29112010104744",
"29909082100161",
"29911290101885",
"29408041200845",
"29809231602049",
"29805020100858",
"29412061401283",
"29409282100139",
"30111151304568",
"30010182502189",
"29606252301491",
"29303282201668",
"29808160102167",
"30103121301324",
"29912030100865",
"30012110100887",
"27506271401143",
"29509091201321",
"29209152302393",
"30004132101345",
"29711252101562",
"29904240104844",
"29707241400081",
"29802048800805",
"30201302103127",
"28004151401695",
"29903102100076",
"28909232100561",
"29603182102071",
"29609282104109",
"30307081601227",
"30107221301408",
"27810038800233",
"28405241402245",
"27201140102498",
"29305042301137",
"30005190104547",
"30207290103566",
"29306142102669",
"28604041600461",
"29807011802532",
"29805042103605",
"27508181302238",
"30103250101803",
"28606140103315",
"30207158800746",
"30004132101361",
"27908012703116",
"30201210104666",
"29609300105797",
"28905110100084",
"30103102305025",
"29107011807788",
"29602118800973",
"30109102102637",
"29709208800599",
"28501032100583",
"30009222103225",
"29911250102307",
"29609010104436",
"29809158800805",
"30108012300409",
"30109012624162",
"29701040100226",
];

const { sequelize, User, Student, event, exam, package: Package, packageCourse } = require("../src/models");
const seedCoursesAndPackage = require("./seedcourses");

/** Event ID used for registrations and grade upload — set by ensureEventAndExams(). */
let EVENT_ID = null;

/**
 * 1) Ensure courses + "Starter Package" exist (run seedcourses if needed).
 * 2) Get or create an event with that packageId (so it has Quiz: IT V3 (Real), etc.).
 * 3) Ensure that event has exam rows for each package course.
 * Use the returned eventId when uploading grades so course titles match.
 */
async function ensureEventAndExams() {
  await seedCoursesAndPackage();

  const pkg = await Package.findOne({ where: { packageName: "Package of seven courses | حزمة سبع دوارات" } });
  if (!pkg) throw new Error("Starter Package not found. Run: node seeder/seedcourses.js");

  const packageCourses = await packageCourse.findAll({
    where: { packageId: pkg.packageId },
    attributes: ["courseId"],
  });
  if (packageCourses.length === 0) throw new Error("No courses linked to Starter Package. Run: node seeder/seedcourses.js");

  let eventRow = await event.findOne({
    where: { packageId: pkg.packageId },
    order: [["createdAt", "DESC"]],
  });

  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() + 7);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 3);
  const startDateRes = new Date(now);
  startDateRes.setDate(startDateRes.getDate() - 7);
  const endDateRes = new Date(startDate);
  endDateRes.setDate(endDateRes.getDate() + 1);

  if (!eventRow) {
    eventRow = await event.create({
      eventName: "Exam Event – Starter Package",
      packageId: pkg.packageId,
      productId: null,
      startDate,
      endDate,
      startDateRes,
      endDateRes,
      capacity: 500,
      numberOfRegistered: 0,
      status: "opend",
      type: "exam",
      language: "AR",
    });
    console.log("✅ Created event for Starter Package:", eventRow.eventId);
  } else {
    console.log("✅ Using existing event for Starter Package:", eventRow.eventId);
  }

  EVENT_ID = "b4a00c2f-216d-4c9f-9078-3246ebb8b9b1";

  const existingExams = await exam.findAll({
    where: { eventId: EVENT_ID },
    attributes: ["courseId"],
  });
  const existingCourseIds = new Set(existingExams.map((e) => e.courseId?.toString()));

  const examDate = new Date();
  examDate.setDate(examDate.getDate() + 14);

  for (const pc of packageCourses) {
    if (existingCourseIds.has(pc.courseId?.toString())) continue;
    await exam.create({
      eventId: EVENT_ID,
      courseId: pc.courseId,
      date: examDate,
      place: null,
      supervisorId: null,
    });
    existingCourseIds.add(pc.courseId?.toString());
  }

  console.log("   → Use this eventId when uploading grades:", EVENT_ID);
}

async function seedStudents() {
  try {
    await sequelize.authenticate();
    console.log("DB Connected...");

    await ensureEventAndExams();

    const hashedPassword = await bcrypt.hash("12345678", 10);

    for (let i = 0; i < nationalIds.length; i++) {
      const nationalId = nationalIds[i];
      const email = `student${i + 1}@test.com`;

      // 1️⃣ Find or create User (idempotent)
      const [user] = await User.findOrCreate({
        where: { email },
        defaults: {
          userId: uuidv4(),
          email,
          passwordHash: hashedPassword,
          role: "STUDENT",
        },
      });

      // 2️⃣ Find or create Student (idempotent)
      const [, studentCreated] = await Student.findOrCreate({
        where: { userId: user.userId },
        defaults: {
          userId: user.userId,
          fullName: `Student ${i + 1}`,
          NameEn: `Student ${i + 1}`,
          Mobile: `0100000${1000 + i}`,
          StudyLan: "EN",
          nationality: "Egyptian",
          nationalId,
          status: "approved",
          university: "Cairo University",
          college: "Computer Science",
          department: "Information Systems",
          type: "1",
        },
      });

      // 3️⃣ Register for event (ignore if already reserved)
      try {
        await reserve.registerForExam(user.userId, EVENT_ID);
      } catch (err) {
        if (err.name === "SequelizeUniqueConstraintError" && err.fields?.reservationId) {
          console.error("\n❌ examReservation table has wrong primary key. Run: node scripts/fix-examReservation-pk.js\n");
          throw err;
        }
        if (err.message?.includes("reserve") || err.message?.includes("register") || err.code === "23505") {
          // already reserved or duplicate
        } else {
          throw err;
        }
      }

      console.log(`✔ ${studentCreated ? "Created" : "Exists"} Student ${i + 1}`);
    }

    console.log("🎉 ALL STUDENTS SEEDED SUCCESSFULLY");
    console.log("   → For grade upload, use eventId:", EVENT_ID);
    process.exit();

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

seedStudents();