const { DataTypes, UUIDV4 } = require("sequelize");

const SystemData = sequelize.define(
  "SystemData",
  {
    numberOfAttemptsAvailableToReexam: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3,
    },
    titlePersonInefada1: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nameOfPersonInefada1: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    titlePersonInefada2: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nameOfPersonInefada2: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "SystemData",
    timestamps: false,
  },
);

module.exports = SystemData;
