const { DataTypes, UUIDV4 } = require("sequelize");

module.exports = (sequelize) => {
  const exam = sequelize.define(
    "exam",
    {
      examId: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: UUIDV4,
      },
      courseId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      supervisorId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      place: {
        type: DataTypes.STRING(200),
      },
      location: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },

      eventId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
    },
    {
      tableName: "exam",
      indexes: [{ fields: ["eventId"] }, { fields: ["courseId"] }],
    },
  );

  return exam;
};
