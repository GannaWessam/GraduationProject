const { Where } = require("sequelize/lib/utils");
const {
  User,
  event,
  training,
  trainingReservation,
  reservation,
  Student,
  Conversation,
  ConversationUser,
  Message,
  trainer,
} = require("../../models");
const { fn, col, Op, where, cast } = require("sequelize");
async function getMyTrainers(userId) {
  const records = await reservation.findAll({
    where: { userId },
    include: [
      {
        model: event,
        as: "reservationEvent",
        include: [
          {
            model: training,
            as: "trainings",
            include: [
              {
                model: trainer,
                as: "trainer",
                attributes: ["userId", "Name"],
              },
            ],
          },
        ],
      },
    ],
  });

  const trainersTable = await trainer.findAll({});

  const trainerMap = new Map();
  trainersTable.forEach((t) => {
    trainerMap.set(t.userId, t);
  });

  const map = new Map();

  for (const r of records) {
    if (!r.reservationEvent) continue;

    for (const tr of r.reservationEvent.trainings || []) {
      if (tr.trainer) {
        const trainerInfo = trainerMap.get(tr.trainer.userId);
        map.set(tr.trainer.userId, {
          user: tr.trainer.userInfo,
          trainer: trainerInfo,
        });
      }
    }
  }

  const formattedTrainers = [...map.values()].map(({ user, trainer }) => ({
    userId: trainer?.userId || null,
    email: user?.email || null,
    fullName: trainer?.Name || null, 
  }));


  return {
    status: 200,
    message: "Trainers fetched successfully",
    data: formattedTrainers,
    total: formattedTrainers.length,
  };
}

async function getMyUsers(trainerUserId) {
  const trainings = await training.findAll({
    where: { trainerId: trainerUserId },
    include: [
      {
        model: trainingReservation,
        include: [
          {
            model: Student,
            include: [
              {
                model: User,
                attributes: ["userId", "email"],
              },
            ],
          },
        ],
      },
    ],
  });

  const map = new Map();

  for (const t of trainings) {
    for (const r of t.trainingReservations || []) {
      const student = r.Student;
      const user = student?.User;
      if (user) {
        // store both user and student info
        map.set(user.userId, { user, student });
      }
    }
  }

  // now map over entries and pass both user and student
  const users = [...map.values()].map(({ user, student }) => ({
    userId: user.userId,
    email: user.email || null,
    fullName: student.fullName || null,
    imageUrl: student.profilePhoto || null, // or whatever field you have
  }));

  return {
    status: 200,
    message: "Users fetched successfully",
    data: users,
    total: users.length,
  };
}

async function getConversationsByUserId(userId) {
  const memberships = await ConversationUser.findAll({
    where: { userId },
    attributes: ["conversationId"],
  });

  const conversationIds = memberships.map((x) => x.conversationId);
  if (conversationIds.length === 0) return [];

  const conversations = await Conversation.findAll({
    where: { conversationId: conversationIds },
    order: [["updatedAt", "DESC"]],
  });

  const allMembers = await ConversationUser.findAll({
    where: { conversationId: conversationIds },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["userId", "email"],
        include: [
          { model: Student, attributes: ["fullName"] },
          { model: trainer, attributes: ["Name"] },
        ],
      },
    ],
  });

  const allLastMessagesRaw = await Message.findAll({
    where: { conversationId: conversationIds },
    include: [
      {
        model: User,
        as: "sender",
        attributes: ["userId", "email"],
        include: [
          { model: Student, attributes: ["fullName"] },
          { model: trainer, attributes: ["Name"] },
        ],
      },
    ],
    order: [
      ["conversationId", "ASC"],
      ["sentAt", "DESC"],
    ],
  });

  const lastMessagesMap = {};
  for (const msg of allLastMessagesRaw) {
    if (!lastMessagesMap[msg.conversationId]) {
      lastMessagesMap[msg.conversationId] = msg;
    }
  }

  const result = conversations.map((conv) => {
    const members = allMembers
      .filter((m) => m.conversationId === conv.conversationId)
      .map((m) => m.user);

    let chatWith = null;
    let chatWithId=null
    if (conv.type === "direct") {
      const otherUser = members.find((u) => u.userId !== userId);
      
      if (otherUser) {
        chatWith =
          otherUser.Student?.fullName ||
          otherUser.trainer?.Name ||
          otherUser.email;
          chatWithId=otherUser.userId
      }
    }
    

    const lastMsg = lastMessagesMap[conv.conversationId];
    const lastMessageDto = lastMsg
      ? {
          messageId: lastMsg.messageId,
          content: lastMsg.content,
          status: lastMsg.status,
          sentAt: lastMsg.sentAt,
          senderId: lastMsg.senderId,
          senderEmail: lastMsg.sender.email,
          type:lastMsg.type,
          duration:lastMsg.duration,
          senderName:
            lastMsg.sender.Student?.fullName ||
            lastMsg.sender.trainer?.Name ||
            null,
        }
      : null;

    return {
      conversationId: conv.conversationId,
      type: conv.type,
      eventId: conv.eventId,
      name: conv.name,
      chatWith,
      chatWithId,
      lastMessage: lastMessageDto,
    };
  });

  return result;
}

async function getMessagesByConversationId(conversationId) {
  const messages = await Message.findAll({
    where: { conversationId },
    include: [
      {
        model: User,
        as: "sender",
        attributes: ["userId", "email"],
      },
    ],
    order: [["sentAt", "ASC"]],
  });

  const formattedMessages = messages.map((msg) => ({
    messageId: msg.messageId,
    conversationId: msg.conversationId,
    sender: msg.sender
      ? {
          userId: msg.sender.userId,
          fullName: msg.sender.fullName,
          email: msg.sender.email,
          imageUrl: msg.sender.imageUrl,
        }
      : null,
    receiverIds: msg.receiverIds,
    content: msg.content,
    status: msg.status,
    sentAt: msg.sentAt,
    type: msg.type || "text",
    duration: msg.duration || null,
    senderName:msg.senderName
  }));

  return {
    status: 200,
    message: "Messages fetched successfully",
    data: formattedMessages,
    total: formattedMessages.length,
  };
}
async function getUnreadCounts(userId) {
  try {
    const unreadMessages = await Message.findAll({
      attributes: [
        "conversationId",
        [fn("COUNT", col("messageId")), "unreadCount"],
      ],

      where: {
        receiverIds: {
          [Op.contains]: cast([userId], "uuid[]"),
        },

        [Op.not]: [
          where(
            col("seenBy"),
            Op.contains,
            cast([userId], "uuid[]")
          ),
        ],
      },

      group: ["conversationId"],

      raw: true,
    });

    return unreadMessages.reduce((acc, item) => {
      acc[item.conversationId] = Number(item.unreadCount);
      return acc;
    }, {});
  } catch (error) {
    console.error(error);
    throw error;
  }
}



module.exports = {
  getMyTrainers,
  getMyUsers,
  getConversationsByUserId,
  getMessagesByConversationId,
  getUnreadCounts
};
