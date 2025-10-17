const { DataTypes, UUIDV4 } = require('sequelize');

module.exports = (sequelize) => {
  const studentCourse = sequelize.define('studentCourse', {

    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: UUIDV4,
    },

    courseId: { 
        type: DataTypes.UUID, 
        allowNull: false,
        
    },

    userId: { 
        type: DataTypes.UUID, 
        allowNull: false,
    },

    status: { type: DataTypes.STRING(200), allowNull: false },

    
  }, {
    tableName: 'studentCourse',
  });

  return studentCourse;
};