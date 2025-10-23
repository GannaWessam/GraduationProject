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
    //null | pending | done 
    examStatus: { 
      type: DataTypes.STRING(200),
      allowNull: true, 
      
    },
    trainingStatus: { 
      type: DataTypes.STRING(200),
      allowNull: true, 
      
    },

    
  }, {
    tableName: 'studentCourse',
  });

  return studentCourse;
};