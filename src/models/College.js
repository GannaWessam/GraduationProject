const { DataTypes, UUIDV4 } = require('sequelize');

module.exports = (sequelize) => {
  const College = sequelize.define('College', {
    collegeId: { 
      type: DataTypes.UUID, 
      primaryKey: true, 
      defaultValue: UUIDV4 
    },

    Name: { 
      type: DataTypes.STRING(200), 
      allowNull: false 
    },

    
  }, {
    tableName: 'colleges',
  });

  return College;
};