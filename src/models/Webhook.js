const { DataTypes, UUIDV4 } = require('sequelize');

module.exports = (sequelize) => {
  const webhook = sequelize.define('webhook', {
    
    webhookId: { 
      type: DataTypes.UUID, 
      primaryKey: true, 
    },
    webhookEvent:{
        type: DataTypes.STRING(200),  
    },

  }, {
    tableName: 'webhook',
  });

  return webhook;
};