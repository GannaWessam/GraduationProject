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
    // opend or closed only
    status: { type: DataTypes.STRING(200), allowNull: false },

    //either exam or training
    type: {type: DataTypes.STRING(200), allowNull: false },

    // Language of the event (e.g., "AR", "EN") - matches Student.StudyLan
    language: { 
      type: DataTypes.STRING(200), 
      allowNull: true,
      defaultValue: 'AR'  // so existing rows get a value when column is added (sync/alter)
    }

    
  }, {
    tableName: 'event',
  });

  return event;
};