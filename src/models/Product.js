const { DataTypes, UUIDV4 } = require('sequelize');

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    productId: { 
      type: DataTypes.UUID, 
      primaryKey: true, 
      defaultValue: UUIDV4 
    },

    courseName: { 
      type: DataTypes.STRING(200), 
      allowNull: false 
    },

    priceEgyptian: { 
      type: DataTypes.DECIMAL(12, 2), 
      allowNull: false, 
      defaultValue: 0 
    },

    priceOther: { 
      type: DataTypes.DECIMAL(12, 2), 
      allowNull: false, 
      defaultValue: 0 
    },
    
    currency: { 
      type: DataTypes.STRING(200), 
      allowNull: false 
    },

    examStatus: { 
      type: DataTypes.BOOLEAN, 
      allowNull: true, 
      defaultValue: true, 
    },
    trainingStatus: { 
      type: DataTypes.BOOLEAN, 
      allowNull: true, 
      defaultValue: true, 
    },
    requirdCourses: { 
      type: DataTypes.INTEGER, 
      allowNull: true,  
    },

  }, {
    tableName: 'products',
  });

  return Product;
};
