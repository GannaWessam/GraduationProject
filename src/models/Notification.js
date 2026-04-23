const { DataTypes, UUIDV4 } = require('sequelize');

module.exports = (sequelize) => {
  const notification = sequelize.define('notification', {
    notificationId: { 
        type: DataTypes.UUID, primaryKey: true, defaultValue: UUIDV4,
    },
    name: { 
        type: DataTypes.STRING(200), 
        allowNull:false
    },
    description: { 
        type: DataTypes.STRING(200), 
        allowNull:false
    },
    userId:{
        type: DataTypes.UUID,
        allowNull: false  
    },
    type:{
      type:DataTypes.STRING(200),
      allowNull:true
    },
    Status:{
      type:DataTypes.STRING(200),
      allowNull:false,
      defaultValue:"dilevered"
    },
    redirectUrl: { 
      type: DataTypes.STRING(200), 
      allowNull:true
  },
  }, {
    tableName: 'notification',
  });

  return notification;
};