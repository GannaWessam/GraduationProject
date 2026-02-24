const { DataTypes, UUIDV4 } = require('sequelize');

module.exports = (sequelize) => {
  const efada = sequelize.define('efada', {
    efadaId: { type: DataTypes.UUID, primaryKey: true, defaultValue: UUIDV4},
    userId: { type: DataTypes.UUID, allowNull: true},
    paymentId:{ type: DataTypes.UUID, allowNull: true},
    date: { type: DataTypes.DATE, allowNull: false},
  }, {
    tableName: 'efada',
  });

  return efada;
};