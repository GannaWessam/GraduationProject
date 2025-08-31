const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Student = sequelize.define('Student', {
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    fullName: { type: DataTypes.STRING(200), allowNull: false, },
    nationality: { type: DataTypes.STRING(100), allowNull: true },
    nationalId: { type: DataTypes.STRING(50), allowNull: false, unique: true, },
    nationalIdImage: { type: DataTypes.STRING(300), allowNull: true, },
    examType: { type: DataTypes.ENUM('ONE_EXAM', 'SEVEN_EXAM'), allowNull: true, },
    courseType: {
      type: DataTypes.ENUM('EXAM_AND_COURSE', 'EXAM_ONLY'),
      allowNull: false,
      defaultValue: 'EXAM_AND_COURSE',
    },
    university: { type: DataTypes.STRING(150), allowNull: true },
    college: { type: DataTypes.STRING(150), allowNull: true },
  }, {
    tableName: 'students',
    // indexes: [
    //   { unique: true, fields: ['user_id'] },
    //   { unique: true, fields: ['national_id'] },
    //   { fields: ['course_type'] },
    // ],
  });

  return Student;
};
