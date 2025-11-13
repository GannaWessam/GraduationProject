const express = require('express');
const router = express.Router();
const chatController = require('./chatController');

// Create direct conversation
router.post('/conversations', chatController.createConversation);

// Create training group conversation
router.post('/conversations/training-group', chatController.createTrainingGroupConversation);

// Get user's conversations
router.get('/conversations/user/:userId', chatController.getUserConversations);

// Get messages for a conversation
router.get('/conversations/:conversationId/messages', chatController.getMessages);

// Send a message
router.post('/messages', chatController.sendMessage);

// Get message by ID
router.get('/messages/:messageId', chatController.getMessageById);

// Update message status
router.put('/messages/:messageId/status', chatController.updateMessageStatus);

// Mark all messages as read
router.post('/conversations/:conversationId/read', chatController.markAllMessagesAsRead);

// Get chatted users sorted by last message
router.get('/users/:userId/chatted', chatController.getChattedUsers);

module.exports = router;


