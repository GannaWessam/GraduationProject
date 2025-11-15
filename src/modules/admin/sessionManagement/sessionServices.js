const { session: Session, training: Training, sequelize } = require("../../../models/index");
const PaginatedResponse = require("../../../Util/PaginatedResponse");

const sessionService = {
  async createSession(data) {
    const { trainingId, name, startTime, endTime, date, virtualLink } = data;

    if (!trainingId || !name || !startTime || !endTime || !date || !virtualLink)
      throw new Error("all_fields_required");

    const training = await Training.findByPk(trainingId);
    if (!training) throw new Error("training_not_found");

    return Session.create(data);
  },

  async getAllSessions(features) {
    const { count, rows } = await Session.findAndCountAll({
      ...features.options,
      distinct: true,
      include: [
        {
          model: Training,
          as: "sessionTraining",
          attributes: ["trainingId", "name"],
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
          attributes: ["trainingId", "name"],
        },
      ],
    });

    if (!session) throw new Error("session_not_found");
    return session;
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
