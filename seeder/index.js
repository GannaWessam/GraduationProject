const { sequelize } = require("../src/models");

// Import all seeders
const seedNationalities = require("./seednationality");
const seedUniversitiesAndColleges = require("./seeder");
const seedCoursesAndProducts = require("./seedCoursesAndProducts");
const seedProducts = require("./seedProducts");
const seedStudents = require("./seedStudents");
const seedEventsAndReservations = require("./seedEventsAndReservations");

async function runAllSeeders() {
  try {
    console.log("🌱 Starting database seeding process...\n");
    
    // Sync database to ensure all tables exist
    await sequelize.sync({ alter: false });
    console.log("✅ Database tables synchronized\n");

    // Seed in order (respecting dependencies):
    // 1. Nationalities (no dependencies)
    console.log("📋 Step 1/6: Seeding Nationalities...");
    await seedNationalities();
    console.log("");

    // 2. Universities and Colleges (no dependencies)
    console.log("📋 Step 2/6: Seeding Universities and Colleges...");
    await seedUniversitiesAndColleges();
    console.log("");

    // 3. Courses and Products (no dependencies, but products may reference courses later)
    console.log("📋 Step 3/6: Seeding Courses and Products...");
    await seedCoursesAndProducts();
    console.log("");

    // 4. Additional Products with Allowed Types
    console.log("📋 Step 4/6: Seeding Additional Products...");
    await seedProducts();
    console.log("");

    // 5. Users and Students (students depend on users)
    console.log("📋 Step 5/6: Seeding Users and Students...");
    await seedStudents();
    console.log("");

    // 6. Events, trainers, supervisors (for reservation + group chat testing)
    console.log("📋 Step 6/6: Seeding Events & Reservations test data...");
    await seedEventsAndReservations();
    console.log("");

    console.log("🎉 All seeders completed successfully!");
    console.log("\n📝 Summary:");
    console.log("   - Nationalities seeded");
    console.log("   - Universities and Colleges seeded");
    console.log("   - Courses and Products seeded");
    console.log("   - Users and Students seeded");
    console.log("   - Events, trainers, supervisors seeded");
    console.log("\n✅ Database seeding process completed!");
    
  } catch (err) {
    console.error("\n❌ Error during seeding process:", err);
    console.error(err.stack);
    throw err;
  } finally {
    // Close database connection
    await sequelize.close();
    console.log("\n🔒 Database connection closed.");
  }
}

// Run if called directly
if (require.main === module) {
  runAllSeeders()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error("Fatal error:", err);
      process.exit(1);
    });
}

module.exports = runAllSeeders;
