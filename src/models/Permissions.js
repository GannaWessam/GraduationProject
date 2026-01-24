const { DataTypes, UUIDV4 } = require("sequelize");

module.exports = (sequelize) => {
  const Permission = sequelize.define(
    "Permission",
    {
      permissionId: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: UUIDV4,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      containerId: {
        type: DataTypes.UUID,
        allowNull: true, // optional
      },
    },
    {
      tableName: "permissions",
    }
  );

  return Permission;
};
