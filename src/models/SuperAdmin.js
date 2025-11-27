const { DataTypes, UUIDV4 } = require('sequelize');

module.exports = (sequelize) => {
  const SuperAdmin = sequelize.define('SuperAdmin', {
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
    tableName: 'SuperAdmin',
  });

  return SuperAdmin;
};