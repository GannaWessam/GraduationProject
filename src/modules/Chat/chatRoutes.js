const express = require("express");
const router = express.Router();
const chatController = require("./chatController");
const { validateToken } = require("../../middlewares/token");
const { uploadVoiceMessage } = require("../../middlewares/UploadVoiceNotes");

// Send a message on a conversation
router.post("/messages", chatController.sendMessageOnConversation);
router.post("/voice",uploadVoiceMessage ,chatController.sendVoiceOnConversation);

// Create a group conversation
router.post("/conversations/group", chatController.createGroupConversation);

// Create a direct conversation
router.post("/conversations/direct", chatController.createDirectConversation);

// Get online users
router.get("/users/online", chatController.getOnlineUsers);

// Get group members
router.get(
  "/conversations/:conversationId/members",
  chatController.getGroupMembers
);

// Handle message seen
router.put("/messages/seen", chatController.handleMessageSeen);

router.get("/my-people", validateToken, chatController.getMyPeople);

router.get(
  "/conversations/:conversationId/messages",
  validateToken,
  chatController.fetchMessages
);

router.get('/conversations', validateToken, chatController.fetchConversations);


module.exports = router;
