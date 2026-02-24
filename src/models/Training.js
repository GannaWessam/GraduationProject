const { DataTypes, UUIDV4 } = require('sequelize');

module.exports = (sequelize) => {
  const training = sequelize.define('training', {
    trainingId: { 
      type: DataTypes.UUID, 
      primaryKey: true, 
      defaultValue: UUIDV4 
    },
    courseId: { 
      type: DataTypes.UUID, 
      allowNull: true 
    },
    trainerId: { 
      type: DataTypes.UUID, 
      allowNull: true 
    },
    eventId: {
      type: DataTypes.UUID, 
      allowNull: false  
    }
  }, {
    tableName: 'training',
    indexes: [
      { fields: ['eventId'] },  
      { fields: ['courseId'] },
      { fields: ['trainerId'] },
    ],
  });

  return training;
};