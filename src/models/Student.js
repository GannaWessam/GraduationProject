const { DataTypes } = require("sequelize");
require('dotenv').config();

module.exports = (sequelize) => {
  const Student = sequelize.define(
    "Student",
    {
      userId: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      fullName: { type: DataTypes.STRING(200), allowNull: false },
      NameEn: { type: DataTypes.STRING(200), allowNull: false },
      Mobile: { type: DataTypes.STRING(200), allowNull: false },
      StudyLan: { type: DataTypes.STRING(200), allowNull: false },
      nationality: { type: DataTypes.STRING(100), allowNull: true },
      QRdata: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      nationalId: { type: DataTypes.STRING(50), allowNull: false, unique: true },
      nationalIdImage: {
        type: DataTypes.STRING(300),
        allowNull: true,
        get() {
          const rawValue = this.getDataValue("nationalIdImage");
          return rawValue ? `${process.env.HOST_BACK}/uploads/${rawValue}` : null;
        },
      },
      nationalIdImageBack: {
        type: DataTypes.STRING(300),
        allowNull: true,
        get() {
          const rawValue = this.getDataValue("nationalIdImageBack");
          return rawValue ? `${process.env.HOST_BACK}/uploads/${rawValue}` : null;
        },
      },
      university: { type: DataTypes.STRING(150), allowNull: true },
      college: { type: DataTypes.STRING(150), allowNull: true },
      department: { type: DataTypes.STRING(150), allowNull: true },
      type: { type: DataTypes.ENUM("1", "2", "3", "4"), allowNull: true },
      status: { type: DataTypes.STRING(200), allowNull: false },
      profilePhoto: { type: DataTypes.STRING(10000), allowNull: true },
      productId: { type: DataTypes.UUID, allowNull: true },
    },
    {
      tableName: "students",
      indexes: [
        { unique: true, fields: ['userId'] },
        { unique: true, fields: ['nationalId'] },
        { fields: ['university'] },
        { fields: ['college'] },
      ],
    }
  );

  return Student;
};