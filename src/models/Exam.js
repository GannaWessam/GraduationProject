const { DataTypes, UUIDV4 } = require('sequelize');

module.exports = (sequelize) => {
  const exam = sequelize.define('exam', {
    examId: { 
      type: DataTypes.UUID, 
      primaryKey: true, 
      defaultValue: UUIDV4 
    },

    supervisorId: { 
      type:DataTypes.UUID, 
      allowNull: true 
    },
    date:{
    type: DataTypes.DATE,       
    allowNull: false
    },
    place:{
        type: DataTypes.STRING(200),  
    }

    
  }, {
    tableName: 'exam',
  });

  return exam;
};