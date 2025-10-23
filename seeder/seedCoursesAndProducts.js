// seedCoursesAndProducts.js
const { v4: uuidv4 } = require("uuid");
const { sequelize, course, Product } = require("../src/models/index"); // ✅ غيّري المسار حسب مشروعك

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully.");

    // --- عينة كورسات ---
    const coursesData = [
      {
        courseId: uuidv4(),
        name: "Web Development Fundamentals",
      },
      {
        courseId: uuidv4(),
        name: "Database Design Essentials",
      },
      {
        courseId: uuidv4(),
        name: "Advanced Python Programming",
      },
    ];

    // --- عينة منتجات ---
    const productsData = [
      {
        productId: uuidv4(),
        courseName: "Frontend Development Kit",
        priceEgyptian: 1500.0,
        priceOther: 75.0,
        examStatus: true,
        trainingStatus: true,
        requirdCourses: 2,
      },
      {
        productId: uuidv4(),
        courseName: "Backend Mastery Bundle",
        priceEgyptian: 2200.0,
        priceOther: 110.0,
        examStatus: true,
        trainingStatus: false,
        requirdCourses: 3,
      },
      {
        productId: uuidv4(),
        courseName: "Database Pro Tools",
        priceEgyptian: 1800.0,
        priceOther: 90.0,
        examStatus: false,
        trainingStatus: true,
        requirdCourses: 1,
      },
    ];

    // --- عملية الإدخال ---
    await sequelize.sync(); // لو الجداول مش متولدة
    await course.bulkCreate(coursesData, { ignoreDuplicates: true });
    await Product.bulkCreate(productsData, { ignoreDuplicates: true });

    console.log("✅ Seeded courses and products successfully.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  }
})();
