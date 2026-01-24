const { DataTypes, UUIDV4 } = require("sequelize");

module.exports = (sequelize) => {
  const Container = sequelize.define(
    "Container",
    {
      containerId: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: UUIDV4,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "containers",
    }
  );

  return Container;
};
