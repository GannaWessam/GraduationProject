const { DataTypes, UUIDV4 } = require('sequelize');

module.exports = (sequelize) => {
  const Profile = sequelize.define('Profile', {
    profileId: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: UUIDV4,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
  }, {
    tableName: 'profiles',
  });

  return Profile;
};
