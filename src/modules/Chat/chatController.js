const chattingService = require('../../Services/chattingService');
const ApiResponse = require('../../Util/ApiResponse');

/**
 * Send a message on a conversation
 * POST /api/chat/messages
 */
const sendMessageOnConversation = async (req, res, next) => {
  try {
    const { message, senderId, conversationId } = req.body;

    if (!message || !senderId || !conversationId) {
      return res.status(400).json(
        ApiResponse.error(400, 'message, senderId, and conversationId are required')
      );
    }

    const result = await chattingService.sendMessageOnConversation(
      message,
      senderId,
      conversationId
    );

    res.status(200).json(
      ApiResponse.success(result, 'Message sent successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Create a group conversation
 * POST /api/chat/conversations/group
 */
const createGroupConversation = async (req, res, next) => {
  try {
    const { usersIds, eventId, groupName } = req.body;

    if (!usersIds || !Array.isArray(usersIds) || usersIds.length < 2) {
      return res.status(400).json(
        ApiResponse.error(400, 'usersIds (array with at least 2 users) is required')
      );
    }

    if (!groupName) {
      return res.status(400).json(
        ApiResponse.error(400, 'groupName is required')
      );
    }

    const conversation = await chattingService.createGroupConversation(
      usersIds,
      eventId || null,
      groupName
    );

    res.status(201).json(
      ApiResponse.created(conversation, 'Group conversation created successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Create a direct conversation
 * POST /api/chat/conversations/direct
 */
const createDirectConversation = async (req, res, next) => {
  try {
    const { usersIds } = req.body;

    if (!usersIds || !Array.isArray(usersIds) || usersIds.length !== 2) {
      return res.status(400).json(
        ApiResponse.error(400, 'usersIds (array with exactly 2 users) is required')
      );
    }

    const conversation = await chattingService.createDirectConversation(usersIds);

    res.status(201).json(
      ApiResponse.created(conversation, 'Direct conversation created successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get online users
 * GET /api/chat/users/online
 */
const getOnlineUsers = async (req, res, next) => {
  try {
    const onlineUsers = await chattingService.getOnlineUsers();
    
    // Convert Set to Array for JSON response
    const onlineUsersArray = Array.from(onlineUsers);

    res.status(200).json(
      ApiResponse.success(onlineUsersArray, 'Online users retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get group members
 * GET /api/chat/conversations/:conversationId/members
 */
const getGroupMembers = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    if (!conversationId) {
      return res.status(400).json(
        ApiResponse.error(400, 'conversationId is required')
      );
    }

    const members = await chattingService.getGroupMembers(conversationId);

    res.status(200).json(
      ApiResponse.success(members, 'Group members retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Handle message seen
 * PUT /api/chat/messages/:messageId/seen
 */
const handleMessageSeen = async (req, res, next) => {
  try {
    const { messageId } = req.params;

    if (!messageId) {
      return res.status(400).json(
        ApiResponse.error(400, 'messageId is required')
      );
    }

    await chattingService.handleMessageSeen(messageId);

    res.status(200).json(
      ApiResponse.success(null, 'Message marked as seen successfully')
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessageOnConversation,
  createGroupConversation,
  createDirectConversation,
  getOnlineUsers,
  getGroupMembers,
  handleMessageSeen
};
