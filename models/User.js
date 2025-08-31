const { DataTypes, UUIDV4 } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    userId: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: UUIDV4,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('STUDENT', 'ADMIN', 'MANAGER'),
      allowNull: false,
      defaultValue: 'STUDENT',
    },
  }, {
    tableName: 'users',
    // indexes: [{ unique: true, fields: ['email'] }, { fields: ['role'] }],
  });

  return User;
};
