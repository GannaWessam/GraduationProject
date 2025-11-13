const express = require('express');
const router = express.Router();
const chatController = require('./chatController');

// Send a message on a conversation
router.post('/messages', chatController.sendMessageOnConversation);

// Create a group conversation
router.post('/conversations/group', chatController.createGroupConversation);

// Create a direct conversation
router.post('/conversations/direct', chatController.createDirectConversation);

// Get online users
router.get('/users/online', chatController.getOnlineUsers);

// Get group members
router.get('/conversations/:conversationId/members', chatController.getGroupMembers);

// Handle message seen
router.put('/messages/:messageId/seen', chatController.handleMessageSeen);

module.exports = router;

