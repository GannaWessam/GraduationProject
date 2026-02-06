const { v4: uuidv4 } = require("uuid");
const {
  sequelize,
  Product,
  ProductAllowedUserType,
} = require("../src/models/index");

const seedProducts = async () => {
  try {
    await sequelize.authenticate();
    console.log("🚀 Starting seeding products and allowed types...");

    const productsData = [
      {
        productId: uuidv4(),
        courseName: "AI Foundations Program",
        priceEgyptian: 2500,
        priceOther: 125,
        examStatus: true,
        trainingStatus: true,
        requirdCourses: 3,
      },
      {
        productId: uuidv4(),
        courseName: "Cloud Engineering Bootcamp",
        priceEgyptian: 2800,
        priceOther: 140,
        examStatus: true,
        trainingStatus: true,
        requirdCourses: 4,
      },
      {
        productId: uuidv4(),
        courseName: "Cybersecurity Starter Pack",
        priceEgyptian: 2000,
        priceOther: 100,
        examStatus: false,
        trainingStatus: true,
        requirdCourses: 2,
      },
    ];

    // Check existing products
    const existingProducts = await Product.findAll({ attributes: ['courseName'] });
    const existingProductNames = new Set(existingProducts.map(p => p.courseName));
    
    const newProducts = productsData.filter(p => !existingProductNames.has(p.courseName));
    
    if (newProducts.length > 0) {
      await Product.bulkCreate(newProducts, { ignoreDuplicates: true });
      console.log(`✅ Seeded ${newProducts.length} new products (${existingProductNames.size} already existed)`);
      
      // Fetch the newly created products to get their IDs
      const allProducts = await Product.findAll({
        where: { courseName: productsData.map(p => p.courseName) }
      });
      
      // Create allowed types for new products only
      const newAllowedTypes = allProducts
        .filter(p => newProducts.some(np => np.courseName === p.courseName))
        .map((product) => ({
          id: uuidv4(),
          productId: product.productId,
          userType: "1",
        }));
      
      if (newAllowedTypes.length > 0) {
        // Check existing allowed types
        const existingAllowedTypes = await ProductAllowedUserType.findAll({
          attributes: ['productId', 'userType']
        });
        const existingTypeKeys = new Set(
          existingAllowedTypes.map(at => `${at.productId}-${at.userType}`)
        );
        
        const typesToCreate = newAllowedTypes.filter(
          at => !existingTypeKeys.has(`${at.productId}-${at.userType}`)
        );
        
        if (typesToCreate.length > 0) {
          await ProductAllowedUserType.bulkCreate(typesToCreate, { ignoreDuplicates: true });
          console.log(`✅ Seeded ${typesToCreate.length} new product allowed types`);
        } else {
          console.log("✅ All product allowed types already exist");
        }
      }
    } else {
      console.log(`✅ All products already exist (${existingProductNames.size} total)`);
    }

    return { success: true };
  } catch (error) {
    console.error("❌ Error seeding products:", error);
    throw error;
  }
};

module.exports = seedProducts;

