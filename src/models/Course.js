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
    }

    
  }, {
    tableName: 'course',
  });

  return course;
};