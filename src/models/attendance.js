const { DataTypes, UUIDV4 } = require('sequelize');

module.exports = (sequelize) => {
  const Attendance = sequelize.define(
    'Attendance',
    {
      attendanceId: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: UUIDV4,
      },

      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      sessionId: {
        type: DataTypes.UUID,
        allowNull: false,
      },

    },
    {
      tableName: 'attendance',
      timestamps: true, // createdAt & updatedAt
      indexes: [
        {
          unique: true,
          fields: ['userId', 'sessionId'], // يمنع تكرار الحضور
        },
      ],
    }
  );

  return Attendance;
};