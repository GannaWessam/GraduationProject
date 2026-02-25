const { DataTypes, UUIDV4 } = require("sequelize");

module.exports = (sequelize) => {
  const RegisterRequest = sequelize.define(
    "RegisterRequest",
    {
      Id: { type: DataTypes.UUID, primaryKey: true, defaultValue: UUIDV4 },
      userId: { type: DataTypes.UUID, allowNull: true },
      ProductId: { type: DataTypes.UUID, allowNull: false },
      paymentId: { type: DataTypes.UUID, allowNull: true },
      date: { type: DataTypes.DATE, allowNull: false },
    },
    {
      tableName: "RegisterRequest",
    },
  );

  return RegisterRequest;
};
