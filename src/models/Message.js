const { DataTypes, UUIDV4 } = require('sequelize');

module.exports = (sequelize) => {
  const Message = sequelize.define('Message', {
    messageId: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: UUIDV4
    },
    conversationId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    receiverIds: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      allowNull: false,
      defaultValue: []
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('sent', 'delivered', 'seen'),
      allowNull: false,
      defaultValue: 'sent'
    },
    sentAt: {
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
    },
    seenBy: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      allowNull: false,
      defaultValue: []
    },
  }, {
    tableName: 'messages',
    timestamps: true
  });

  return Message;
};


