const { DataTypes, UUIDV4 } = require('sequelize');

module.exports = (sequelize) => {
  const reservation = sequelize.define('reservation', {
    reservationId: { 
      type: DataTypes.UUID, 
      primaryKey: true, 
      defaultValue: UUIDV4 
    },

    userId: { 
        type:DataTypes.UUID, 
        allowNull: false 
    },
    eventId:{
        type:DataTypes.UUID, 
        allowNull: true 
    },
    courseId:{
        type:DataTypes.UUID, 
        allowNull: false 
    },
    type:{
        type: DataTypes.STRING(200), allowNull: false     
    },
    status:{
        type: DataTypes.STRING(200), allowNull: false   
    }

    
  }, {
    tableName: 'reservation',
  });

  return reservation;
};