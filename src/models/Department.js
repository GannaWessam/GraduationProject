const { DataTypes, UUIDV4 } = require('sequelize');
const College = require('./College');

module.exports = (sequelize) => {
  const department = sequelize.define('department', {
    DepartmentId: { 
      type: DataTypes.UUID, 
      primaryKey: true, 
      defaultValue: UUIDV4 
    },

    Name: { 
      type: DataTypes.STRING(200), 
      allowNull: false 
    },

    CollegeId: { 
        type: DataTypes.UUID,
        allowNull: false 
      },

    
  }, {
    tableName: 'Department',
  });

  return department;
};