const { Transaction, Op } = require("sequelize");
const {
  Conversation,
  ConversationUser,
  Message,
  sequelize,
  User,
} = require("../models/index.js");

class ChattingService {
  async sendMessageOnConversation(message, senderId, conversationId) {
    const WebSocketService = require("./WebSocket"); // <- lazy require here

    const conversation = await this.findConversationById(conversationId);
    if (!conversation) throw new Error("Conversation not found");

    const conversationUsers = await ConversationUser.findAll({
      where: { conversationId },
    });

    const conversationUsersIds = conversationUsers.map(u => u.userId);
    const receiverIds = conversationUsersIds.filter(id => id !== senderId);

    const newMessage = await Message.create({
      content: message,
      senderId,
      conversationId,
      receiverIds,
    });

    // Notify all online users
    await WebSocketService.notifySpecificClients(
      {
        type:"message",
        message,
        id:newMessage.messageId,
        messageTime: newMessage.sentAt,
        senderId,
        receiverIds,
      },
      conversationId
    );

    for (const receiverId of receiverIds) {
      console.log(WebSocketService.onlineUsers);
      
      
      if (WebSocketService.onlineUsers.has(receiverId)) {
        await this.handleOnlineUserMessageDelivery(newMessage);
        WebSocketService.notifySpecificClients(
          { type: "delivered", receiverIds: [receiverId, newMessage.senderId],message:newMessage.messageId },
          newMessage.conversationId
        );
      }
    }

    return newMessage; // return message for WebSocket use if needed
  }

  async findConversationById(conversationId) {
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) throw new Error("Conversation not found");
    return conversation;
  }

  async createConversation(usersIds, eventId, groupName) {
    if (usersIds.length < 2) throw new Error("At least 2 users are required");
    if (usersIds.length > 2) {
      return await this.createGroupConversation(usersIds, eventId, groupName);
    } else if (usersIds.length === 2) {
      return await this.createDirectConversation(usersIds);
    } else throw new Error("Invalid number of users");
  }

  async createGroupConversation(usersIds, eventId, groupName) {
    return await sequelize.transaction(async (t) => {
      const conversation = await Conversation.create(
        { type: "group", name: groupName, eventId },
        { transaction: t }
      );

      for (const userId of usersIds) {
        await ConversationUser.create(
          { conversationId: conversation.conversationId, userId },
          { transaction: t }
        );
      }
      return conversation;
    });
  }

  async createDirectConversation(usersIds) {
    const directConversations = await ConversationUser.findAll({
      where: { userId: usersIds },
      include: [
        {
          model: Conversation,
          as: "conversation",
          where: { type: "direct" },
          attributes: ["conversationId"],
        },
      ],
      attributes: ["conversationId"],
    });

    const counts = {};
    directConversations.forEach((c) => {
      const convId = c.conversationId;
      counts[convId] = (counts[convId] || 0) + 1;
    });

    const existingConversationId = Object.keys(counts).find(
      (id) => counts[id] === 2
    );

    if (existingConversationId) {
      throw new Error(
        "Cannot create conversation with same users more than once"
      );
    }

    return await sequelize.transaction(async (t) => {
      const conversation = await Conversation.create(
        { type: "direct" },
        { transaction: t }
      );

      for (const userId of usersIds) {
        await ConversationUser.create(
          { conversationId: conversation.conversationId, userId },
          { transaction: t }
        );
      }
      return conversation;
    });
  }

  async getOnlineUsers() {
    const WebSocketService = require("./WebSocket"); // lazy require
    return WebSocketService.onlineUsers;
  }

  async handleOnlineUserMessageDelivery(message) {
    message.status = "delivered";
    await message.save();
  }

  async syncMessagesAfterOffline(receiverId) {
    const WebSocketService = require("./WebSocket"); // lazy require

    const messages = await Message.findAll({
      where: {
        status: "sent",
        receiverIds: { [Op.contains]: [receiverId] },
      },
    });

    for (const message of messages) {
      WebSocketService.notifySpecificClients(
        {
          message: message.content,
          messageTime: message.sentAt,
          senderId: message.senderId,
          receiverIds: receiverId,
        },
        message.conversationId
      );

      message.status = "delivered";
      await message.save();
    }
  }

  async getGroupMembers(conversationId) {
    const conversation = await this.findConversationById(conversationId);
    const conversationUsers = await ConversationUser.findAll({
      where: { conversationId },
    });
    return conversationUsers.map(u => u.userId);
  }

  async handleMessageSeen(messageId) {
    const WebSocketService = require("./WebSocket"); // lazy require

    const message = await Message.findByPk(messageId);
    if (!message) throw new Error("Message not found");

    WebSocketService.notifySpecificClients(
      { type: "seen", receiverIds: [message.senderId, ...message.receiverIds] },
      message.conversationId
    );

    message.status = "seen";
    await message.save();
  }
}

module.exports = new ChattingService();
