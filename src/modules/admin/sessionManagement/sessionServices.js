const { session: Session, training: Training, sequelize } = require("../../../models/index");
const PaginatedResponse = require("../../../Util/PaginatedResponse");
const { Op } = require("sequelize");

const sessionService = {

  async createSession(sessionData) {
    // 1) تأكد إن ال training موجود
    const trainingObj = await Training.findByPk(sessionData.trainingId);
    if (!trainingObj) {
      throw new Error("Training not found");
    }
  
    const eventId = trainingObj.eventId;
  
    // 2) هات كل ال trainings اللي جوه نفس ال event
    const trainingsInEvent = await Training.findAll({
      where: { eventId },
      attributes: ["trainingId"]
    });
  
    const trainingIdsInEvent = trainingsInEvent.map(t => t.trainingId);
  
    // 3) اعمل تشيك تداخل
    const conflict = await Session.findOne({
      where: {
        date: sessionData.date,
        trainingId: {
          [Op.in]: trainingIdsInEvent   // هنا التعديل المحترم
        },
        // overlap condition
        [Op.and]: [
          { startTime: { [Op.lt]: sessionData.endTime } },
          { endTime: { [Op.gt]: sessionData.startTime } }
        ]
      }
    });
  
    if (conflict) {
      throw new Error("Session time overlaps with another session in the same training or event");
    }
  
    // 4) create session
    const newSession = await Session.create({
      ...sessionData,
    });
  
    return newSession;
  },

  async getAllSessions(features) {
    const { count, rows } = await Session.findAndCountAll({
      ...features.options,
      distinct: true,
      include: [
        {
          model: Training,
          as: "sessionTraining",
          attributes: ["trainingId", "courseId"],
        },
      ],
    });

    return PaginatedResponse.fromApiFeature(
      features,
      count,
      rows,
      "Sessions fetched successfully"
    );
  },

  async getSessionById(id) {
    const session = await Session.findByPk(id, {
      include: [
        {
          model: Training,
          as: "sessionTraining",
          attributes: ["trainingId", "courseId"],
        },
      ],
    });

    if (!session) throw new Error("session_not_found");
    return session;
  },

  async getSessionByTrainingId(id) {
    const sessions = await Session.findAll({
      where: { trainingId: id },
      include: [
        {
          model: Training,
          as: "sessionTraining",
          attributes: ["trainingId", "courseId"]
        }
      ]
    });
  
    if (!sessions || sessions.length === 0) {
      throw new Error("session_not_found");
    }
  
    return sessions;
  },

  async getSessionsByEventId(eventId) {
    const sessions = await Session.findAll({
      include: [
        {
          model: Training,
          as: "sessionTraining", 
          attributes: ["trainingId", "courseId", "eventId"],
          where: { eventId }       
        }
      ]
    });
  
    if (!sessions || sessions.length === 0) {
      throw new Error("sessions_not_found");
    }
  
    return sessions;
  },

  async updateSession(id, data) {
    return sequelize.transaction(async (t) => {
      const session = await Session.findByPk(id, { transaction: t });
      if (!session) throw new Error("session_not_found");

      await session.update(data, { transaction: t });
      return session;
    });
  },

  async deleteSession(id) {
    return sequelize.transaction(async (t) => {
      const session = await Session.findByPk(id, { transaction: t });
      if (!session) throw new Error("session_not_found");

      await session.destroy({ transaction: t });
      return { message: "Session deleted successfully" };
    });
  },
};

module.exports = sessionService;
