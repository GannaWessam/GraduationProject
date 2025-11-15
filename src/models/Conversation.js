const { DataTypes, UUIDV4 } = require('sequelize');

module.exports = (sequelize) => {
  const Conversation = sequelize.define('Conversation', {
    conversationId: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: UUIDV4
    },
    type: {
      type: DataTypes.ENUM('direct', 'group'),
      allowNull: false,
      defaultValue: 'direct'
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: true // null for direct conversations, required for groups
    },
    eventId: {
      type: DataTypes.UUID,
      allowNull: true // null for direct conversations, set for training groups
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
    tableName: 'conversations',
    timestamps: true
  });

  return Conversation;
};


