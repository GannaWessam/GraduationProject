const { DataTypes, UUIDV4 } = require('sequelize');

module.exports = (sequelize) => {
  const Nationality = sequelize.define('Nationality', {
    NationalityId: { 
      type: DataTypes.UUID, 
      primaryKey: true, 
      defaultValue: UUIDV4 
    },

    Name: { 
      type: DataTypes.STRING(200), 
      allowNull: false 
    },

    
  }, {
    tableName: 'nationalitys',
  });

  return Nationality;
};