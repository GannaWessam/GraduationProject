const { DataTypes, UUIDV4 } = require('sequelize');

module.exports = (sequelize) => {
  const course = sequelize.define('course', {
    courseId: { 
        type: DataTypes.UUID, 
        primaryKey: true, 
        defaultValue: UUIDV4 
    },

    productId: { 
    type:DataTypes.UUID, 
    allowNull: false 
    },
    name:{
    type: DataTypes.STRING(200),  
    allowNull: false
    }

    
  }, {
    tableName: 'course',
  });

  return course;
};