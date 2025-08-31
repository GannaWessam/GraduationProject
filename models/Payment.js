const { DataTypes, UUIDV4 } = require('sequelize');

module.exports = (sequelize) => {
  const Payment = sequelize.define('Payment', {
    paymentId: { type: DataTypes.UUID, primaryKey: true, defaultValue: UUIDV4, },
    userId: { type: DataTypes.UUID, allowNull: false,},
    productId: { type: DataTypes.UUID, allowNull: false,},
    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    orderId: { type: DataTypes.STRING(100), allowNull: false,},
    timestamp: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    status: { type: DataTypes.ENUM('PENDING', 'SUCCESS', 'FAILED'), allowNull: false, defaultValue: 'PENDING' },
  }, {
    tableName: 'payments',
    // indexes: [
    //   { fields: ['user_id'] },
    //   { fields: ['product_id'] },
    //   { fields: ['order_id'], unique: true },
    //   { fields: ['status'] },
    //   { fields: ['timestamp'] },
    // ],
  });

  return Payment;
};
