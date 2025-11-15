const { User, event, training, trainingReservation, reservation, Student ,Conversation, ConversationUser,Message} = require('../../models');

/* -------------------------- Helper Function -------------------------- */
function formatUser(user) {
  if (!user) return null;

  return {
    userId: user.userId,
    email: user.email || null,
    fullName: user.name || null,
    imageUrl: user.imageUrl || null,
  };
}

/* ----------------------- Get My Trainers ------------------------ */
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
                model: User,
                as: "trainer",
                attributes: ["userId", "email"],
              },
            ],
          },
        ],
      },
    ],
  });

  const map = new Map();

  for (const r of records) {
    if (!r.reservationEvent) continue;

    for (const tr of r.reservationEvent.trainings || []) {
      if (tr.trainer) {
        map.set(tr.trainer.userId, tr.trainer);
      }
    }
  }

  const trainers = [...map.values()].map(formatUser);

  return {
    status: 200,
    message: "Trainers fetched successfully",
    data: trainers,
    total: trainers.length,
  };
}

/* ----------------------- Get My Users ------------------------ */
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
      const user = r.Student?.User;
      if (user) {
        map.set(user.userId, user);
      }
    }
  }

  const users = [...map.values()].map(formatUser);

  return {
    status: 200,
    message: "Users fetched successfully",
    data: users,
    total: users.length,
  };
}


async function getConversationsByUserId(userId) {
  const conversations = await Conversation.findAll({
    include: [
      {
        model: ConversationUser,
        as: "members",
        where: { userId }, // the user is a member
        attributes: []     // exclude join row
      },
      {
        model: ConversationUser,
        as: "members",
        include: [
          {
            model: User,
            as: "user",
            attributes: ["userId", "fullName", "email", "imageUrl"]
          }
        ]
      }
    ],
    order: [["updatedAt", "DESC"]]
  });

  return conversations;
}




async function getMessagesByConversationId(conversationId) {
  // Fetch messages and include sender info
  const messages = await Message.findAll({
    where: { conversationId },
    include: [
      {
        model: User,
        as: 'sender',
        attributes: ['userId', 'fullName', 'email', 'imageUrl']
      }
    ],
    order: [['sentAt', 'ASC']]
  });

  // Format messages
  const formattedMessages = messages.map(msg => ({
    messageId: msg.messageId,
    conversationId: msg.conversationId,
    sender: msg.sender ? {
      userId: msg.sender.userId,
      fullName: msg.sender.fullName,
      email: msg.sender.email,
      imageUrl: msg.sender.imageUrl
    } : null,
    receiverIds: msg.receiverIds,
    content: msg.content,
    status: msg.status,
    sentAt: msg.sentAt
  }));

  return {
    status: 200,
    message: 'Messages fetched successfully',
    data: formattedMessages,
    total: formattedMessages.length
  };
}




/* -------------------- Export functions -------------------- */
module.exports = {
  getMyTrainers,
  getMyUsers,
  getConversationsByUserId,
  getMessagesByConversationId
};
