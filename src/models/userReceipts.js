const { DataTypes, UUIDV4 } = require('sequelize');

module.exports = (sequelize) => {
  const userReceipts = sequelize.define('userReceipts', {
    
    receiptId: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: UUIDV4,
      },  
    userId: { 
      type: DataTypes.UUID,  
      allowNull: false
    },

    paymentId: { 
        type: DataTypes.UUID, 
        allowNull: false
      },
    receipt: { 
        type: DataTypes.STRING(300), 
    },
    
  }, {
    tableName: 'userReceipts',
  });

  return userReceipts;
};