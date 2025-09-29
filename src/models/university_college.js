const { DataTypes, UUIDV4 } = require('sequelize');

module.exports = (sequelize) => {
  const UniversityCollege  = sequelize.define('UniversityCollege', {
    Id: { 
      type: DataTypes.UUID, 
      primaryKey: true, 
      defaultValue: UUIDV4 
    },

    universityId: { 
      type: DataTypes.UUID,
      allowNull: false,
      
    },

    collegeId: { 
        type: DataTypes.UUID,
        allowNull: false,
      },

    
  }, {
    tableName: 'universityCollege ',
  });

  return UniversityCollege ;
};