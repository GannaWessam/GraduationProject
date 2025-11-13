const { DataTypes, UUIDV4 } = require('sequelize');

module.exports = (sequelize) => {
  const ConversationUser = sequelize.define('ConversationUser', {
    conversationUserId: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: UUIDV4
    },
    conversationId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    // role: {
    //   type: DataTypes.ENUM('student', 'admin', 'trainer'),
    //   allowNull: false,
    //   defaultValue: 'student'
    // },
    joinedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'conversation_users',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['conversationId', 'userId']
      }
    ]
  });

  return ConversationUser;
};


