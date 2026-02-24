const { DataTypes, UUIDV4 } = require("sequelize");

module.exports = (sequelize) => {
  const Service = sequelize.define(
    "Service",
    {
      serviceId: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: UUIDV4,
      },

      name: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },

      priceEgyptian: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },

      priceOther: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      receiptId: { type: DataTypes.INTEGER, allowNull: true },
      receiptIdOthers: { type: DataTypes.INTEGER, allowNull: true },

      currencyId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
    },
    {
      tableName: "services",
    },
  );

  return Service;
};
