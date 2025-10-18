const { DataTypes, UUIDV4 } = require('sequelize');

module.exports = (sequelize) => {
  const event = sequelize.define('event', {
    eventId: { 
      type: DataTypes.UUID, 
      primaryKey: true, 
      defaultValue: UUIDV4 
    },
    startDate:{
    type: DataTypes.DATE,       
    allowNull: false
    },
    endDate:{
    type: DataTypes.DATE,
    allowNull: false    
    },
    capacity: {
        type: DataTypes.INTEGER,     
        allowNull: false,
        validate: {
            min: 1                     
        }
    },

    numberOfRegistered: {
        type: DataTypes.INTEGER,     
        allowNull: false,
        defaultValue: 0,             
        validate: {
        min: 0
        }
    },
    status: { type: DataTypes.STRING(200), allowNull: false },

    //either course or training
    type: {type: DataTypes.STRING(200), allowNull: false }

    
  }, {
    tableName: 'event',
  });

  return event;
};