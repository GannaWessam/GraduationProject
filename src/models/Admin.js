const { DataTypes, UUIDV4 } = require('sequelize');

module.exports = (sequelize) => {
  const Admin = sequelize.define('Admin', {
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
    tableName: 'Admin',
  });

  return Admin;
};