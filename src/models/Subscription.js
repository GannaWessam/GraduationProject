const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Subscription = sequelize.define(
    "Subscription",
    {
      userId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      endpoint: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
      },
      p256dh: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      auth: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      tableName: "push_subscriptions",
      timestamps: true,
    }
  );

  return Subscription;
};
