const { DataTypes, UUIDV4 } = require('sequelize');

module.exports = (sequelize) => {
  const packages = sequelize.define('packages', {
    packageId: { 
      type: DataTypes.UUID, 
      primaryKey: true, 
      defaultValue: UUIDV4 
    },
    // productId: { 
    //   type:DataTypes.UUID, 
    //   allowNull: false 
    // },
    packageName:{
        type: DataTypes.STRING(200),  
    },

    size: { 
        type:DataTypes.INTEGER, 
        allowNull: true 
    },

    
  }, {
    tableName: 'packages',
  });

  return packages;
};