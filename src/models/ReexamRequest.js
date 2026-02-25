const { DataTypes, UUIDV4 } = require('sequelize');

module.exports = (sequelize) => {
  const ReexamRequest = sequelize.define('ReexamRequest', {
    ReexamId: { type: DataTypes.UUID, primaryKey: true, defaultValue: UUIDV4},
    userId: { type: DataTypes.UUID, allowNull: true},
    courseId: { type: DataTypes.UUID, allowNull: false},
    paymentId:{ type: DataTypes.UUID, allowNull: true},
    date: { type: DataTypes.DATE, allowNull: false},
  }, {
    tableName: 'ReexamRequest',
  });

  return ReexamRequest;
};