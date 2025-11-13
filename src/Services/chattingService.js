const WebSocketService = require('./WebSocket');
const { Transaction } = require('sequelize');
const { Op } = require("sequelize");
const { Conversation, ConversationUser, Message, sequelize } = require('../models/index.js');

class ChattingService {
  async sendMessageOnConversation(message, senderId, conversationId) {
    const conversation = await this.findConversationById(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    const conversationUsers = await ConversationUser.findAll({
     where: {
        conversationId: conversationId
      }
    });
    const conversationUsersIds = conversationUsers.map((conversationUser)=>conversationUser.userId);
    const receiverIds = conversationUsersIds.filter((userId)=>userId !== senderId);
    const newMessage = await Message.create({
      content: message,
      senderId: senderId,
      conversationId: conversationId,
      receiverIds: receiverIds,
    });
    await WebSocketService.notifySpecificClients({
        message,
        messageTime: newMessage.sentAt,
        senderId,
        receiverIds,
      },
      conversationId);//conversationId => tupe identifier
     
    for(const receiverId of receiverIds){   
        if(WebSocketService.onlineUsers.has(receiverId) ){
            await this.handleOnlineUserMessageDelivery(newMessage);
            WebSocketService.notifySpecificClients(
                { type: 'delivered', receiverIds: [receiverId, newMessage.senderId] }, newMessage.conversationId);
        }
    }
    return true;
  }
  async findConversationById(conversationId) {
    const conversation = await Conversation.findByPk(conversationId);
    if (conversation) {
      return conversation;
    }
    else {
      throw new Error('Conversation not found');
    }
  }
  async createConversation(usersIds, eventId, groupName) { //nullabel
    if (usersIds.length < 2) {
      throw new Error('At least 2 users are required to create a conversation');
    }
    if (usersIds.length > 2) {
      return await this.createGroupConversation(usersIds, eventId, groupName);
    }
    else if (usersIds.length === 2) {
      return await this.createDirectConversation(usersIds);
    }
    else {
      throw new Error('Invalid number of users');
    }
  }
  async createGroupConversation(usersIds, eventId, groupName) {
    const result = await sequelize.transaction(async (t) => {
      const conversation = await Conversation.create({
        type: 'group',
        name: groupName,
        eventId: eventId
      }, { transaction: t });
      for (const userId of usersIds) {
        await ConversationUser.create({
          conversationId: conversation.conversationId,
          userId: userId
        }, { transaction: t });
      }
      return conversation;
    });
    if(result){
      return result;
    }
    else{
      throw new Error('Error creating group conversation');
    }
  }
  async createDirectConversation(usersIds) {
    const result = await sequelize.transaction(async (t) => {
      const conversation = await Conversation.create({}, { transaction: t });
      for (const userId of usersIds) {
        await ConversationUser.create({
          conversationId: conversation.conversationId,
          userId: userId
        }, { transaction: t });
      }
      return conversation;
    });
    if(result){
      return result;
    }
    else{
      throw new Error('Error creating direct conversation');
    }
  }
  async getOnlineUsers() {
    return WebSocketService.onlineUsers;
  }
  async handleOnlineUserMessageDelivery(message) {
    message.status = 'delivered';
    await message.save();
  }
  async syncMessagesAfterOffline(receiverId) {
    const messages = await Message.findAll({
        where: {
            status: 'sent',
            receiverIds: {
                [Op.contains]: [receiverId]
            }
        }
    });
    if (messages) {
        for(const message of messages) {
            WebSocketService.notifySpecificClients({
                message: message.content,
                messageTime: message.sentAt,
                senderId: message.senderId,
                receiverIds: receiverId,
            },message.conversationId);
            message.status = 'delivered'; //If a message has 3 receivers, and only one comes online,you are marking it delivered for all 3.
            await message.save();
        }
    }
  } 
  async getGroupMembers(conversationId) {
    const conversation = await this.findConversationById(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    const conversationUsers = await ConversationUser.findAll({
      where: {
        conversationId: conversationId
      }
    });
    return conversationUsers.map((conversationUser)=>conversationUser.userId);
  }
  async handleMessageSeen(messageId) {
    const message = await Message.findByPk(messageId);
    if (!message) {
      throw new Error('Message not found');
    }
    WebSocketService.notifySpecificClients({
         type: 'seen', receiverIds: [message.senderId, ...message.receiverIds] }, message.conversationId);
    message.status = 'seen';
    await message.save();
  }
}

module.exports = new ChattingService();