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
    const WebSocketService = require("./WebSocket");

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
    await WebSocketService.notifyClients({
      type:"chat",
    },receiverIds)
    console.log(receiverIds);
    
    const allOnline = receiverIds.every(id => WebSocketService.onlineUsers.has(id));
    if(allOnline)
    {
      await this.handleOnlineUserMessageDelivery(newMessage);
      WebSocketService.notifySpecificClients(
        {
          type: "delivered",
          receiverIds: [...receiverIds, newMessage.senderId],
          message: newMessage.messageId
        },
        newMessage.conversationId
      );
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
    const WebSocketService = require("./WebSocket");
    return WebSocketService.onlineUsers;
  }

  async handleOnlineUserMessageDelivery(message) {
    message.status = "delivered";
    await message.save();
  }

  async syncMessagesAfterOffline(receiverId) {
    const WebSocketService = require("./WebSocket");

    const messages = await Message.findAll({
      where: {
        status: "sent",
        receiverIds: { [Op.contains]: [receiverId] },
      },
    });

    console.log(messages.length);
    for (const message of messages) {
      WebSocketService.notifySpecificClients(
        {
          type:"number",
          senderId: message.senderId,
          receiverIds: receiverId,
          length:messages.length
        },
        message.conversationId
      );
      const allOnline = message.receiverIds.every(id =>
        WebSocketService.onlineUsers.has(id)
      );
      if (!allOnline) {
        continue;
      }
      WebSocketService.notifySpecificClients(
        { type: "delivered", receiverIds: [message.senderId],message:message.messageId },
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

  async handleChatSeen(conversationId, receiverId) {
    const WebSocketService = require("./WebSocket");
  
    // Fetch messages not fully seen yet
    const messages = await Message.findAll({
      where: {
        conversationId,
        receiverIds: { [Op.contains]: [receiverId] },
      },
    });
  
    const updatedMessages = [];
  
    for (const message of messages) {
      const seenBy = message.seenBy || [];
  
      // Skip if this receiver already saw it
      if (seenBy.includes(receiverId)) continue;
  
      // Add this receiver
      const newSeenBy = [...seenBy, receiverId];
      message.seenBy = newSeenBy;
  
      // If all receivers have seen, mark status as 'seen'
      if (newSeenBy.length === message.receiverIds.length) {
        message.status = "seen";
      }
  
      await message.save();
      updatedMessages.push(message);
  
      // Notify sender that message status updated
      if (message.status === "seen") {
        WebSocketService.notifySpecificClients(
          {
            type: "seen",
            receiverIds: [message.senderId],
            messages: [message],
          },
          conversationId
        );
      }
    }
  
    return updatedMessages;
  }
  
  
  async  getUsersWithCommonConversations(userId) {
    const userConversations = await ConversationUser.findAll({
      where: { userId },
      attributes: ["conversationId"],
    });
    const conversationIds = userConversations.map(c => c.conversationId);
    if (conversationIds.length === 0) return [];
    const otherUsers = await ConversationUser.findAll({
      where: {
        conversationId: conversationIds,
        userId: { [Op.ne]: userId }
      },
      attributes: ["userId"],
      group: ["userId"],
    });
  
    return otherUsers.map(u => u.userId);
  }
}

module.exports = new ChattingService();
