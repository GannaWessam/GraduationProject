const { DataTypes, UUIDV4 } = require('sequelize');

module.exports = (sequelize) => {
  const Currency = sequelize.define('currency', {
    currencyId: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: UUIDV4,
    },

    code: {
      type: DataTypes.STRING(3),
      allowNull: false,
      unique: true,
    },

    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    symbol: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
  }, {
    tableName: 'currency',
  });

  return Currency;
};
