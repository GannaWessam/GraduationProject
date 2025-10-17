const { DataTypes, UUIDV4 } = require('sequelize');

module.exports = (sequelize) => {
  const productCourse = sequelize.define('productCourse', {


    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: UUIDV4,
    },

    courseId: { 
        type: DataTypes.UUID, 
        allowNull: false,
        
    },

    productId: { 
        type: DataTypes.UUID, 
        allowNull: false,
    },

    
  }, {
    tableName: 'productCourse',
  });

  return productCourse;
};