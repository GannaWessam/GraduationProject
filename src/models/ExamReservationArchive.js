const { DataTypes, UUIDV4 } = require("sequelize");

module.exports = (sequelize) => {
  const ExamReservationArchive = sequelize.define(
    "examReservationArchive",
    {
      archiveId: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: UUIDV4,
      },

      originalExamReservationId: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      reservationId: DataTypes.UUID,
      userId: DataTypes.UUID,
      examId: DataTypes.UUID,

      type: DataTypes.STRING(200),
      attempts: DataTypes.INTEGER,
      result: DataTypes.STRING(200),
      reservationStatus: DataTypes.STRING(200),

      // groups all reservations archived together in the same reset event
      // increments per user each time a reset happens
      cycle: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      archivedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "examReservationArchive",
      timestamps: false,
      indexes: [
        { fields: ["examId"] },
        { fields: ["userId"] },
        { fields: ["userId", "cycle"] },
        { fields: ["archivedAt"] },
      ],
    },
  );

  return ExamReservationArchive;
};