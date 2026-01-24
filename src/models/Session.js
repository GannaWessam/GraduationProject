const { DataTypes, UUIDV4 } = require('sequelize');

module.exports = (sequelize) => {
  const Session = sequelize.define(
    'Session',
    {
      sessionId: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: UUIDV4,
      },

      trainingId: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      name: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },

      startTime: {
        type: DataTypes.TIME,       
        allowNull: false,
      },

      endTime: {
        type: DataTypes.TIME,       
        allowNull: false,
      },

      date: {
        type: DataTypes.DATEONLY,   
        allowNull: false,
      },

      virtualLink: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      material: {
        type: DataTypes.STRING(500),
        allowNull: true,
      }
    },
    {
      tableName: 'sessions',        
      
    }
  );

  return Session;
};
