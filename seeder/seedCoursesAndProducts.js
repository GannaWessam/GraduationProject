// seedCoursesAndProducts.js
const { v4: uuidv4 } = require("uuid");
const { sequelize, course, Product } = require("../src/models/index");

async function seedCoursesAndProducts() {
  try {
    await sequelize.authenticate();
    console.log("🚀 Starting seeding courses and products...");

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

    // Check existing courses
    const existingCourses = await course.findAll({ attributes: ['name'] });
    const existingCourseNames = new Set(existingCourses.map(c => c.name));
    
    const newCourses = coursesData.filter(c => !existingCourseNames.has(c.name));
    if (newCourses.length > 0) {
      await course.bulkCreate(newCourses, { ignoreDuplicates: true });
      console.log(`✅ Seeded ${newCourses.length} new courses (${existingCourseNames.size} already existed)`);
    } else {
      console.log(`✅ All courses already exist (${existingCourseNames.size} total)`);
    }

    // Check existing products
    const existingProducts = await Product.findAll({ attributes: ['courseName'] });
    const existingProductNames = new Set(existingProducts.map(p => p.courseName));
    
    const newProducts = productsData.filter(p => !existingProductNames.has(p.courseName));
    if (newProducts.length > 0) {
      await Product.bulkCreate(newProducts, { ignoreDuplicates: true });
      console.log(`✅ Seeded ${newProducts.length} new products (${existingProductNames.size} already existed)`);
    } else {
      console.log(`✅ All products already exist (${existingProductNames.size} total)`);
    }

    return { success: true };
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  }
}

module.exports = seedCoursesAndProducts;
