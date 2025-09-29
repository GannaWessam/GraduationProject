const { DataTypes, UUIDV4 } = require('sequelize');

module.exports = (sequelize) => {
  const ProductAllowedUserType = sequelize.define('ProductAllowedUserType', {
    id: { 
      type: DataTypes.UUID, 
      defaultValue: UUIDV4, 
      primaryKey: true 
    },

    userType: { 
      type: DataTypes.ENUM('1','2','3','4'), 
      allowNull: false 
    }
  }, {
    tableName: 'product_allowed_user_types',
  });

  return ProductAllowedUserType;
};
