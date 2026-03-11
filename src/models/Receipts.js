const { DataTypes, UUIDV4 } = require('sequelize');

module.exports = (sequelize) => {
  const ReexamRequest = sequelize.define('Receipts', {
    receiptId: { type: DataTypes.INTEGER, primaryKey: true},
    receiptSerialNumber: { type: DataTypes.STRING, allowNull: false},
    receiptName: { type: DataTypes.STRING, allowNull: false},
    description:{ type: DataTypes.STRING, allowNull: false},
    receiptTypeName:{ type: DataTypes.STRING, allowNull: false},
    receiptTypeDescription:{ type: DataTypes.STRING, allowNull: false},
    totalAmount:{ type: DataTypes.DECIMAL, allowNull: false},
    currency:{ type: DataTypes.STRING, allowNull: false,defaultValue:'EGP'},
  }, {
    tableName: 'Receipts',
  });

  return ReexamRequest;
};