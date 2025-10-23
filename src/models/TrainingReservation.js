const { DataTypes, UUIDV4 } = require('sequelize');


module.exports = (sequelize) => {
  const trainingReservation = sequelize.define('trainingReservation', {
    trainingReservationId: { 
      type: DataTypes.UUID, 
      primaryKey: true, 
      defaultValue: UUIDV4 
    },

    reservationId: { 
      type: DataTypes.UUID,  
    },

    userId: { 
        type:DataTypes.UUID, 
        allowNull: false 
    },
    trainingId:{
        type:DataTypes.UUID, 
        allowNull: true 
    },
    type:{
        type: DataTypes.STRING(200), allowNull: false     
    },
    reservationStatus:{
        type: DataTypes.STRING(200), allowNull: false   
    },
    trainigStatus:{
      type: DataTypes.STRING(200), allowNull: false   
  },

    
  }, {
    tableName: 'trainingReservation',
  });

  return trainingReservation;
};