const { DataTypes, UUIDV4 } = require('sequelize');

module.exports = (sequelize) => {
  const resource = sequelize.define('resource', {
    resourceId: { 
      type: DataTypes.UUID, 
      primaryKey: true, 
      defaultValue: UUIDV4 
    },
    name:{
        type: DataTypes.STRING(200),  
    },
    capacity:{
        type: DataTypes.INTEGER,     
        allowNull: false,
        validate: {
            min: 1                     
        }  
    }

    
  }, {
    tableName: 'resource',
  });

  return resource;
};