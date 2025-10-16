const { DataTypes, UUIDV4 } = require('sequelize');
const Product = require('./Product');

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
    },
    ProductType:{
      type: DataTypes.ENUM('1','2','3','4'), 
      allowNull: false   
  }

    
  }, {
    tableName: 'reservation',
  });

  return reservation;
};