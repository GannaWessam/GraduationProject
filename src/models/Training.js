const { DataTypes, UUIDV4 } = require('sequelize');

module.exports = (sequelize) => {
  const training = sequelize.define('training', {
    trainingId: { 
      type: DataTypes.UUID, 
      primaryKey: true, 
      defaultValue: UUIDV4 
    },
    courseId: { 
      type:DataTypes.UUID, 
      allowNull: true 
    },
    trainerId: { 
      type:DataTypes.UUID, 
      allowNull: true 
    },
    startDate:{
    type: DataTypes.DATE,       
    allowNull: false
    },
    endDate:{
    type: DataTypes.DATE,
    allowNull: false    
    },
    virtualLink:{
        type: DataTypes.STRING(200),  
    }

    
  }, {
    tableName: 'training',
  });

  return training;
};