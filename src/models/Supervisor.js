const { DataTypes, UUIDV4 } = require('sequelize');

module.exports = (sequelize) => {
  const supervisor = sequelize.define('supervisor', {
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
    tableName: 'supervisor',
  });

  return supervisor;
};