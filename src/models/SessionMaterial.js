const { DataTypes, UUIDV4 } = require("sequelize");

module.exports = (sequelize) => {
  const SessionMaterial = sequelize.define(
    "SessionMaterial",
    {
      materialId: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: UUIDV4,
      },
      sessionId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(200),
        allowNull: true, 
      },
      file: {
        type: DataTypes.STRING(500), 
        allowNull: false,
      },
      fileType: {
        type: DataTypes.ENUM("pdf", "zip"),
        allowNull: false,
      },
    },
    {
      tableName: "sessionMaterials",
    }
  );

  return SessionMaterial;
};