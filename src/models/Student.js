const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Student = sequelize.define(
    "Student",
    {
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
      },
      fullName: { type: DataTypes.STRING(200), allowNull: false },
      NameEn: { type: DataTypes.STRING(200), allowNull: false },
      Mobile: { type: DataTypes.STRING(200), allowNull: false },
      StudyLan: { type: DataTypes.STRING(200), allowNull: false },
      nationality: { type: DataTypes.STRING(100), allowNull: true },
      QRdata: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      nationalId: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      nationalIdImage: {
        type: DataTypes.STRING(300),
        allowNull: true,
        get() {
          const rawValue = this.getDataValue("nationalIdImage");
          return rawValue ? `http://localhost:3000/uploads/${rawValue}` : null;
        },
      },
      university: { type: DataTypes.STRING(150), allowNull: true },
      college: { type: DataTypes.STRING(150), allowNull: true },
      department: { type: DataTypes.STRING(150), allowNull: true },
      type: { type: DataTypes.ENUM("1", "2", "3", "4"), allowNull: true },
      status: { type: DataTypes.STRING(200), allowNull: false }, // allowed values: approved | pending
      profilePhoto: { type: DataTypes.STRING(10000), allowNull: true },
      productId:{
        type: DataTypes.UUID,
        allowNull: true,
      }
    },
    {
      tableName: "students",
      // indexes: [
      //   { unique: true, fields: ['user_id'] },
      //   { unique: true, fields: ['national_id'] },
      //   { fields: ['course_type'] },
      // ],
    }
  );

  return Student;
};
