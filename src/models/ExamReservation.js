const { DataTypes, UUIDV4 } = require('sequelize');

module.exports = (sequelize) => {
  const examReservation = sequelize.define('examReservation', {
    examReservationId: { 
      type: DataTypes.UUID, 
      primaryKey: true, 
      defaultValue: UUIDV4 
    },

    reservationId: { 
      type: DataTypes.UUID,  
    },


    userId: { 
      type: DataTypes.UUID, 
      allowNull: false,
      references: { model: 'users', key: 'userId' },
      onDelete: 'CASCADE'
    },

    examId: {
      type: DataTypes.UUID, 
      allowNull: true,
      references: { model: 'exam', key: 'examId' },
      onDelete: 'SET NULL'
    },

    type: {
      type: DataTypes.STRING(200), 
      allowNull: false     
    },
    nationalId: {
      type: DataTypes.STRING(200), 
      allowNull: true     
    },

    attempts: {
      type: DataTypes.INTEGER, 
      allowNull: true,
      defaultValue: 1    
    },

    result: {
      type: DataTypes.STRING(200), 
      allowNull: true   
    },

    reservationStatus: {
      type: DataTypes.STRING(200), 
      allowNull: false,
      
    },
    
  }, {
    tableName: 'examReservation',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['examId', 'userId'] },
    ],
  });

  return examReservation;
};