const { DataTypes, UUIDV4 } = require("sequelize");

module.exports = (sequelize) => {
  const packageCourse = sequelize.define(
    "packageCourse",
    {
      Id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: UUIDV4,
      },
      packageId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      courseId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      tableName: "packageCourse",
      indexes: [{ fields: ["packageId"] }, { fields: ["courseId"] }],
    },
  );

  return packageCourse;
};
