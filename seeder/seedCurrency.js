const { v4: uuidv4 } = require("uuid");
const { sequelize, currency } = require("../src/models/index");

const seedCurrencies = async () => {
  const currenciesData = [
    {
      currencyId: uuidv4(),
      code: "EGP",
      name: "Egyptian Pound",
      symbol: "E£",
    },
    {
      currencyId: uuidv4(),
      code: "USD",
      name: "US Dollar",
      symbol: "$",
    },
    {
      currencyId: uuidv4(),
      code: "EUR",
      name: "Euro",
      symbol: "€",
    },
    {
      currencyId: uuidv4(),
      code: "SAR",
      name: "Saudi Riyal",
      symbol: "﷼",
    },
    {
      currencyId: uuidv4(),
      code: "AED",
      name: "UAE Dirham",
      symbol: "د.إ",
    },
  ];

  try {
    await sequelize.authenticate();
    console.log("✅ Database connected.");

    await currency.bulkCreate(currenciesData, {
      ignoreDuplicates: true,
    });

    console.log("✅ Currencies seeded successfully.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding currencies:", error);
    process.exit(1);
  }
};

seedCurrencies();