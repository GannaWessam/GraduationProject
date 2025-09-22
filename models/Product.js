const { DataTypes, UUIDV4 } = require('sequelize');

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    productId: { type: DataTypes.UUID, primaryKey: true, defaultValue: UUIDV4,},
    Category: { type: DataTypes.STRING(200), allowNull: false },
    price: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
    product: {
      type: DataTypes.STRING(200), //********** hasa fe haga msh mzbota
      allowNull: false,
      defaultValue: 'OTHER',
    },
  }, {
    tableName: 'products',
  });

  return Product;
};
