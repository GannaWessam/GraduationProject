const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProfilePermission = sequelize.define('ProfilePermission', {
    profileId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    permissionId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
  }, {
    tableName: 'profile_permissions',
    timestamps: false,
  });

  return ProfilePermission;
};
