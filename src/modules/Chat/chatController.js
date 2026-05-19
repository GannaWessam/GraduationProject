const chattingService = require("../../Services/chattingService");
const ApiResponse = require("../../Util/ApiResponse");
const { getMyTrainers, getMyUsers ,getMessagesByConversationId,getConversationsByUserId, getUnreadCounts} = require("./chatService");

/**
 * Send a message on a conversation
 * POST /api/chat/messages
 */
const sendMessageOnConversation = async (req, res, next) => {
  try {
    const { message, senderId, conversationId,senderName } = req.body;

    if (!message || !senderId || !conversationId || !senderName) {
      return res
        .status(400)
        .json(
          ApiResponse.error(
            400,
            "message, senderId, and conversationId are required"
          )
        );
    }

    const result = await chattingService.sendMessageOnConversation(
      message,
      senderId,
      conversationId,
      type="text",
      duration=null,
      senderName
    );

    res
      .status(200)
      .json(ApiResponse.success(result, "Message sent successfully"));
  } catch (error) {
    return next(error);
  }
};
const sendVoiceOnConversation = async (req, res, next) => {
  try {
    const { senderId, conversationId, duration,senderName } = req.body;
    const file = req.file;

    if (!file || !senderId || !conversationId) {
      return res.status(400).json(
        ApiResponse.error(
          400,
          "file, senderId, and conversationId are required"
        )
      );
    }

    const type = "voice";
    const message = file.filename;
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/voices/${message}`;
    console.log(fileUrl);
    

    const result = await chattingService.sendMessageOnConversation(
      fileUrl,
      senderId,
      conversationId,
      type,
      duration,
      senderName
    );

    res.status(200).json(ApiResponse.success(result, "Message sent successfully"));
  } catch (error) {
    return next(error);
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
      return res
        .status(400)
        .json(
          ApiResponse.error(
            400,
            "usersIds (array with at least 2 users) is required"
          )
        );
    }

    if (!groupName) {
      return res
        .status(400)
        .json(ApiResponse.error(400, "groupName is required"));
    }

    const conversation = await chattingService.createGroupConversation(
      usersIds,
      eventId || null,
      groupName
    );

    res
      .status(201)
      .json(
        ApiResponse.created(
          conversation,
          "Group conversation created successfully"
        )
      );
  } catch (error) {
    return next(error);
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
      return res
        .status(400)
        .json(
          ApiResponse.error(
            400,
            "usersIds (array with exactly 2 users) is required"
          )
        );
    }

    const conversation = await chattingService.createDirectConversation(
      usersIds
    );

    res
      .status(201)
      .json(
        ApiResponse.created(
          conversation,
          "Direct conversation created successfully"
        )
      );
  } catch (error) {
    return next(error);
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

    res
      .status(200)
      .json(
        ApiResponse.success(
          onlineUsersArray,
          "Online users retrieved successfully"
        )
      );
  } catch (error) {
    return next(error);
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
      return res
        .status(400)
        .json(ApiResponse.error(400, "conversationId is required"));
    }

    const members = await chattingService.getGroupMembers(conversationId);

    res
      .status(200)
      .json(
        ApiResponse.success(members, "Group members retrieved successfully")
      );
  } catch (error) {
    return next(error);
  }
};

/**
 * Handle message seen
 * PUT /api/chat/messages/:messageId/seen
 */
const handleMessageSeen = async (req, res, next) => {
  try {
    const { conversationId,receiverId } = req.body;

    if (!conversationId) {
      return res
        .status(400)
        .json(ApiResponse.error(400, "conversationId is required"));
    }

    const results = await chattingService.handleChatSeen(conversationId,receiverId)

    res
      .status(200)
      .json(ApiResponse.success(results, "Message marked as seen successfully"));
  } catch (error) {
    console.log(error);
    
    return next(error);
  }
};

/**
 * Get trainers for a student OR users for a trainer
 * GET /api/chat/my-people
 */

const getMyPeople = async (req, res, next) => {
  try {
    const userId = req.userData.id;
    const role = req.userData.role;

    let data;

    switch (role) {
      case "STUDENT":
        data = await getMyTrainers(userId);
        return res
          .status(200)
          .json(ApiResponse.success(data, "Trainers retrieved successfully"));

      case "TRAINER":
        data = await getMyUsers(userId);
        return res
          .status(200)
          .json(ApiResponse.success(data, "Users retrieved successfully"));

      default:
        return res
          .status(403)
          .json(
            ApiResponse.error(
              403,
              "Only STUDENT or TRAINER can use this endpoint"
            )
          );
    }
  } catch (error) {
    return next(error);
  }
};

const fetchMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const result = await getMessagesByConversationId(conversationId);
    res.status(200).json(ApiResponse.success(result, "Messages retrieved"));
  } catch (error) {
    return next(error);
  }
};

const fetchConversations = async (req, res, next) => {
  try {
    const userId = req.userData.id;

    if (!userId) {
      return res
        .status(400)
        .json(ApiResponse.error(400, "User ID is required"));
    }

    const conversations = await getConversationsByUserId(userId);

    return res
      .status(200)
      .json(
        ApiResponse.success(
          conversations,
          "Conversations retrieved successfully"
        )
      );
  } catch (error) {
    return next(error);
  }
};

const getUnreadMessagesCount = async (req, res, next) => {
  try {
    const userId = req.userData.id;

    if (!userId) {
      return res
        .status(400)
        .json(ApiResponse.error(400, "User ID is required"));
    }

    const count = await getUnreadCounts(userId);

    return res
      .status(200)
      .json(
        ApiResponse.success(
          { unreadCount: count },
          "Unread messages count retrieved successfully"
        )
      );
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  sendMessageOnConversation,
  createGroupConversation,
  createDirectConversation,
  getOnlineUsers,
  getGroupMembers,
  handleMessageSeen,
  getMyPeople,
  fetchMessages,
  fetchConversations,
  sendVoiceOnConversation,
  getUnreadMessagesCount
};
