const { v4: uuidv4 } = require("uuid");
const {
  sequelize,
  Product,
  ProductAllowedUserType,
} = require("../src/models/index");

const seedProducts = async () => {
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

  const allowedTypes = productsData.map((product) => ({
    id: uuidv4(),
    productId: product.productId,
    userType: "1",
  }));

  try {
    await sequelize.authenticate();
    console.log("✅ Database connected.");

    await Product.bulkCreate(productsData, { ignoreDuplicates: true });
    await ProductAllowedUserType.bulkCreate(allowedTypes, {
      ignoreDuplicates: true,
    });

    console.log("✅ Products and allowed types seeded (userType = '1').");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding products:", error);
    process.exit(1);
  }
};

seedProducts();

