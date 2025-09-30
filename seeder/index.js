const { sequelize } = require("../src/models");
//const seedUniversities = require("./20230929123456-universities");
//const seedUniversities = require("./collegeSeeder");
 seedUniversities = require("./uniCollege");

async function runSeeders() {
  try {
    await sequelize.sync(); // يتأكد من وجود الجداول
    await seedUniversities();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding:", err);
    process.exit(1);
  }
}

runSeeders();