const { DataTypes, UUIDV4 } = require('sequelize');

module.exports = (sequelize) => {
  const trainer = sequelize.define('trainer', {
    userId: { 
      type: DataTypes.UUID, 
      primaryKey: true, 
      allowNull: false
    },

    Name: { 
      type: DataTypes.STRING(200), 
      allowNull: false 
    },

    
  }, {
    tableName: 'trainer',
  });

  return trainer;
};