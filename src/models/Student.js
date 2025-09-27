const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Student = sequelize.define('Student', {
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    fullName: { type: DataTypes.STRING(200), allowNull: false, },
    NameEn: { type: DataTypes.STRING(200), allowNull: false, },
    Mobile:{ type: DataTypes.STRING(200), allowNull: false, },
    StudyLan: { type: DataTypes.STRING(200), allowNull: false, },
    nationality: { type: DataTypes.STRING(100), allowNull: true },
    nationalId: { type: DataTypes.STRING(50), allowNull: false, unique: true, },
    nationalIdImage: { type: DataTypes.STRING(300), allowNull: true, },
    examType: { type: DataTypes.ENUM('ONE_EXAM', 'SEVEN_EXAM'), allowNull: true, },
    courseType: {
      type: DataTypes.STRING(200), allowNull: false,
    },
    university: { type: DataTypes.STRING(150), allowNull: true },
    college: { type: DataTypes.STRING(150), allowNull: true },
    type: {type: DataTypes.ENUM('1', '2' ,'3','4'), allowNull: true,}
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
