const { v4: uuidv4 } = require("uuid");
const { sequelize, currency } = require("../src/models/index");

const seedCurrencies = async () => {
  const currenciesData = [
    {
      currencyId: uuidv4(),
      code: "EGP",
      name: "Egyptian Pound | الجنية المصرى",
      symbol: "E£",
    },
    {
      currencyId: uuidv4(),
      code: "USD",
      name: "US Dollar | الدولار الأمريكى",
      symbol: "$",
    },
    {
      currencyId: uuidv4(),
      code: "EUR",
      name: "Euro | اليورو",
      symbol: "€",
    },
    {
      currencyId: uuidv4(),
      code: "SAR",
      name: "Saudi Riyal | الريال السعودى",
      symbol: "﷼",
    },
    {
      currencyId: uuidv4(),
      code: "AED",
      name: "UAE Dirham | الدرهم الامراتى",
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