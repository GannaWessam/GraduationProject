const { Where } = require('sequelize/lib/utils');
const { User, event, training, trainingReservation, reservation, Student ,Conversation, ConversationUser,Message,trainer} = require('../../models');
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
  trainersTable.forEach(t => {
    trainerMap.set(t.userId, t);
  });

  const map = new Map();

  for (const r of records) {
    if (!r.reservationEvent) continue;

    for (const tr of r.reservationEvent.trainings || []) {
      if (tr.trainer) {
        const trainerInfo = trainerMap.get(tr.trainer.userId);
        map.set(tr.trainer.userId, {
          user: tr.trainer.userInfo,  // 👈 access userInfo
          trainer: trainerInfo
        });
      }
    }
  }

  const formattedTrainers = [...map.values()].map(({ user, trainer }) => ({
    userId: trainer?.userId || null,
    email: user?.email || null,
    fullName: trainer?.Name || null,  // 👈 correct Name
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



// const { Conversation, ConversationUser, User, Message } = require('../../models');
const { Op, where } = require('sequelize');

async function getConversationsByUserId(userId) {
  const conversations = await Conversation.findAll({
    include: [
      {
        model: User,
        as: 'users', // correct alias from index.js
        where: { userId }, // ensures the current user is part of the conversation
        attributes: ['userId', 'email']
      },
      {
        model: Message,
        as: 'messages',
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['userId', 'email']
          }
        ],
        limit: 1,
        order: [['sentAt', 'DESC']]
      }
    ],
    order: [['updatedAt', 'DESC']]
  });

  const formatted = conversations.map(conv => ({
    conversationId: conv.conversationId,
    type: conv.type,
    name: conv.name,
    eventId: conv.eventId,
    members: conv.users.map(u => ({
      userId: u.userId,
      email: u.email
    })),
    lastMessage: conv.messages[0]
      ? {
          messageId: conv.messages[0].messageId,
          content: conv.messages[0].content,
          status: conv.messages[0].status,
          sentAt: conv.messages[0].sentAt,
          senderEmail: conv.messages[0].sender.email
        }
      : null
  }));

  return formatted;
}





async function getMessagesByConversationId(conversationId) {
  const messages = await Message.findAll({
    where: { conversationId },
    include: [
      {
        model: User,
        as: 'sender',
        attributes: ['userId', 'email']
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




module.exports = {
  getMyTrainers,
  getMyUsers,
  getConversationsByUserId,
  getMessagesByConversationId
};
