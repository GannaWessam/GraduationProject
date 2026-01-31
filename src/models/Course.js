const { DataTypes, UUIDV4 } = require('sequelize');
 
//course => static data // el training byb'a ala course no3yan w byzwed tafasel el event 
module.exports = (sequelize) => {
  const course = sequelize.define('course', {
    courseId: { 
        type: DataTypes.UUID, 
        primaryKey: true, 
        defaultValue: UUIDV4 
    },

    name:{
    type: DataTypes.STRING(200),  
    allowNull: false
    },

    title:{
      type: DataTypes.STRING(200),  
      allowNull: false,
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
    
    currencyId: { 
      type: DataTypes.UUID,       
      allowNull: true
    },

    
  }, {
    tableName: 'course',
  });

  return course;
};