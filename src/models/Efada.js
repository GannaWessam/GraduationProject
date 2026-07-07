const { DataTypes, UUIDV4 } = require('sequelize');

module.exports = (sequelize) => {
  const efada = sequelize.define('efada', {
    efadaId: { type: DataTypes.UUID, primaryKey: true, defaultValue: UUIDV4},
    userId: { type: DataTypes.UUID, allowNull: true},
    paymentId:{ type: DataTypes.UUID, allowNull: true},
    date: { type: DataTypes.DATE, allowNull: false},
    counter: { type: DataTypes.INTEGER, allowNull: true , defaultValue:0},
  }, {
    tableName: 'efada',
  });

  return efada;
};