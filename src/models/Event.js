const { DataTypes, UUIDV4 } = require('sequelize');

module.exports = (sequelize) => {
  const event = sequelize.define('event', {
    eventId: { 
      type: DataTypes.UUID, 
      primaryKey: true, 
      defaultValue: UUIDV4 
    },
    eventName: { 
      type: DataTypes.STRING(200), 
      allowNull: false 
    },
    packageId:{
      type: DataTypes.UUID,       
      allowNull: true
    },
    productId:{
      type: DataTypes.UUID,       
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
    startDateRes:{
      type: DataTypes.DATE,       
      allowNull: false
    },
    endDateRes:{
      type: DataTypes.DATE,
      allowNull: false    
    },
    capacity: {
        type: DataTypes.INTEGER,     
        allowNull: false,
        validate: { min: 1 }
    },
    numberOfRegistered: {
        type: DataTypes.INTEGER,     
        allowNull: false,
        defaultValue: 0,             
        validate: { min: 0 }
    },
    status: { type: DataTypes.STRING(200), allowNull: false }, // opend or closed only
    type: { type: DataTypes.STRING(200), allowNull: false },  // either exam or training
    language: { 
      type: DataTypes.STRING(200), 
      allowNull: true,
      defaultValue: 'AR'  // existing rows get a value on sync/alter
    },
    retry:{
      type:DataTypes.BOOLEAN,
      allowNull:false,
      defaultValue:false
    }
  }, {
    tableName: 'event',
    indexes: [
      { fields: ['packageId'] },
      { fields: ['productId'] },
      { fields: ['startDate'] },
      { fields: ['endDate'] },
      { fields: ['status'] },
      { fields: ['type'] }
    ],
  });

  return event;
};