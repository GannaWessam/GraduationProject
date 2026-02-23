const { DataTypes, UUIDV4 } = require('sequelize');

module.exports = (sequelize) => {
  const packageProduct = sequelize.define('packageProduct', {
    Id: { 
        type: DataTypes.UUID, 
        primaryKey: true, 
        defaultValue: UUIDV4 
    },
    packageId: { 
        type: DataTypes.UUID, 
        allowNull: false 
    },
    productId: { 
        type: DataTypes.UUID, 
        allowNull: false 
    },
  }, {
    tableName: 'packageProduct',
    indexes: [
      { fields: ['packageId'] },
      { fields: ['productId'] }
    ],
  });

  return packageProduct;
};