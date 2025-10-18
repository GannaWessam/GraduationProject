const { DataTypes, UUIDV4 } = require('sequelize');

module.exports = (sequelize) => {
  const notification = sequelize.define('notification', {
    notificationId: { 
        type: DataTypes.UUID, primaryKey: true, defaultValue: UUIDV4,
    },
    name: { 
        type: DataTypes.STRING(200), 
    },
    description: { 
        type: DataTypes.STRING(200), 
    },
    userId:{
        type: DataTypes.UUID,
        allowNull: false  
    }

    
  }, {
    tableName: 'notification',
  });

  return notification;
};