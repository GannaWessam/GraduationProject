const { sequelize, event, examReservation, trainingReservation, exam, training } = require("../../../models");
const registerForExam = async (userId, examId) => {
  return sequelize.transaction(async (t) => {
    const examObj = await exam.findByPk(examId, { transaction: t });
    if (!examObj) throw new Error("exam_not_found");

    const eventObj = await event.findByPk(examObj.eventId, { transaction: t });
    if (!eventObj) throw new Error("event_not_found");
    if (eventObj.status.trim().toLowerCase() !== "opend") throw new Error("event_closed");
    if (eventObj.type !== "exam") throw new Error("invalid_event_type");

    const alreadyRegistered = await examReservation.findOne({
      where: { userId, examId },
      transaction: t,
    });
    if (alreadyRegistered) throw new Error("already_registered");

    if (eventObj.numberOfRegistered >= eventObj.capacity) throw new Error("event_full");

    await examReservation.create(
      {
        userId,
        examId,
        type: "exam",
        reservationStatus: "pending",
        attempts: 1,
        result: null,
      },
      { transaction: t }
    );

    await eventObj.update(
      { numberOfRegistered: eventObj.numberOfRegistered + 1 },
      { transaction: t }
    );

    return { message: "Registered for exam successfully" };
  });
};

const registerForTraining = async (userId, trainingId) => {
  return sequelize.transaction(async (t) => {
    const trainingObj = await training.findByPk(trainingId, { transaction: t });
    if (!trainingObj) throw new Error("training_not_found");

    const eventObj = await event.findByPk(trainingObj.eventId, { transaction: t });
    if (!eventObj) throw new Error("event_not_found");
    if (eventObj.status.trim().toLowerCase() !== "opend") throw new Error("event_closed");
    if (eventObj.type !== "training") throw new Error("invalid_event_type");

    const alreadyRegistered = await trainingReservation.findOne({
      where: { userId, trainingId },
      transaction: t,
    });
    if (alreadyRegistered) throw new Error("already_registered");

    if (eventObj.numberOfRegistered >= eventObj.capacity) throw new Error("event_full");

    await trainingReservation.create(
      {
        userId,
        trainingId,
        type: "training",
        reservationStatus: "pending",
        trainigStatus: "not_started",
      },
      { transaction: t }
    );

    await eventObj.update(
      { numberOfRegistered: eventObj.numberOfRegistered + 1 },
      { transaction: t }
    );

    return { message: "Registered for training successfully" };
  });
};

module.exports = {
  registerForExam,
  registerForTraining,
};
