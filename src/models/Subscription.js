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
      indexes: [
        {
          unique: true,
          fields: ["userId", "endpoint"],
        },
      ],
    }
  );
  

  return Subscription;
};
