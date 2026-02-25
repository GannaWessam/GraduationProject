const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SystemData = sequelize.define('SystemData', {
    systemDataId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },

    numberOfAttemptsAvailableToReexam: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3
    },

    titlePersonInefada1: {
      type: DataTypes.STRING(200),
      allowNull: true
    },

    nameOfPersonInefada1: {
      type: DataTypes.STRING(200),
      allowNull: true
    },

    titlePersonInefada2: {
      type: DataTypes.STRING(200),
      allowNull: true
    },

    nameOfPersonInefada2: {
      type: DataTypes.STRING(200),
      allowNull: true
    }

  }, {
    tableName: 'SystemData',
    timestamps: false
  });

  return SystemData;
};