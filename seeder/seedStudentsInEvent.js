const XLSX = require("xlsx");

const reserve = require("../src/modules/user/reserveEvents/reservationService");

const { sequelize, Student } = require("../src/models");

/**
 * READ NATIONAL IDS FROM EXCEL
 */
function loadNationalIds(filePath) {
  const workbook = XLSX.readFile(filePath);

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const data = XLSX.utils.sheet_to_json(sheet);

  // Excel column name must be: nationalId
  return data
    .map(row => String(row.nationalId).trim())
    .filter(Boolean);
}

async function registerStudentsToEvent(eventId) {
  try {
    await sequelize.authenticate();

    console.log("✅ DB Connected");

    // ---------------- READ EXCEL ----------------
    const nationalIds = loadNationalIds("students.xlsx");

    console.log(`📄 Loaded ${nationalIds.length} national IDs`);

    // ---------------- FIND STUDENTS ----------------
    const students = await Student.findAll({
      where: {
        nationalId: nationalIds
      },
      attributes: ["userId", "nationalId"]
    });

    console.log(`✅ Found ${students.length} matching students`);

    // ---------------- REGISTER ----------------
    let successCount = 0;
    let failedCount = 0;

    for (const student of students) {
      try {
        await reserve.registerForExam(
          student.userId,
          eventId
        );

        successCount++;

        console.log(
          `✔ Registered ${student.nationalId}`
        );

      } catch (err) {

        failedCount++;

        console.log(
          `❌ Failed ${student.nationalId}: ${err.message}`
        );
      }
    }

    // ---------------- SUMMARY ----------------
    console.log("\n🎉 REGISTRATION FINISHED");
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Failed: ${failedCount}`);

    process.exit();

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

/**
 * RUN
 * node registerStudents.js EVENT_ID
 */

const eventId = process.argv[2];

if (!eventId) {
  console.log("❌ Please provide eventId");
  process.exit(1);
}

registerStudentsToEvent(eventId);