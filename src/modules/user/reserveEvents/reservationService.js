const {
  event,
  exam,
  course,
  packageCourse,
  package: Package,
  reservation,
  examReservation,
  sequelize,
  training,
  trainingReservation,
  Student,
  examReservationArchive
} = require("../../../models");
const { Op } = require("sequelize");
const {
  handleCreateGroupChatForEvent,
  archiveReservation,
  canRetakeAfterFiveYears,
} = require("./helpers/helper");

const checkStudentEligibility = require("./helpers/checkStudentEligibility");  


const registerForExam = async (userId, eventId, req) => {
  return sequelize.transaction(async (t) => {
    const eventData = await event.findOne({
      where: { eventId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!eventData) throw new Error("Event not found");
    if (eventData.capacity <= eventData.numberOfRegistered) {
      eventData.status = "closed";
      await eventData.save({ transaction: t });
      throw new Error("Cannot register for this event");
    }

    const existingReservation = await reservation.findOne({ where: { userId, eventId }, transaction: t });
    if (existingReservation) throw new Error("You already reserved this event before.");

    const eligible = await checkStudentEligibility(userId, t);
    if (!eligible) throw new Error("You cannot register because you already passed all previous exams.");

    const examsToReserve = await exam.findAll({ where: { eventId }, transaction: t });
    if (examsToReserve.length === 0) throw new Error("No exams found for this event.");

    const newReservation = await reservation.create({ userId, eventId }, { transaction: t });
    const examReservations = [];

for (const ex of examsToReserve) {
  const courseId = ex.courseId;

  const previousAttempts = await examReservation.findAll({
    where: { userId },
    include: [
      {
        model: exam,
        as: "exam",
        where: { courseId },
        attributes: ["examId", "courseId"],
      },
    ],
    order: [["attempts", "DESC"]],
    transaction: t,
  });

  let attemptNumber = 1;

  if (previousAttempts.length > 0) {
    const lastAttempt = previousAttempts[0];

    if (lastAttempt.result !== null && lastAttempt.result >= 65) {
      const allowed = canRetakeAfterFiveYears(lastAttempt);
      if (!allowed) throw new Error("You cannot retake exams in this course before 5 years.");
    }

   
    for (const prev of previousAttempts) {
      if ( prev.result < 65 || prev.reservationStatus === "failed") {
        await examReservationArchive.create({
          originalExamReservationId: prev.examReservationId,
          reservationId: prev.reservationId,
          userId: prev.userId,
          examId: prev.examId,
          type: prev.type,
          attempts: prev.attempts,
          result: prev.result,
          reservationStatus: prev.reservationStatus,
        }, { transaction: t });

        await prev.destroy({ transaction: t });
        attemptNumber = Math.max(attemptNumber, prev.attempts + 1);
      }
    }
  }

  const newExamReservation = await examReservation.create({
    reservationId: newReservation.reservationId,
    userId,
    examId: ex.examId,
    type: "exam",
    reservationStatus: "reserved",
    attempts: attemptNumber,
    result: null,
  }, { transaction: t });

  examReservations.push(newExamReservation);
}

    const student = await Student.findOne({ where: { userId }, transaction: t });
    if (student) {
      student.status = "reserved Exam";
      await student.save({ transaction: t });
    }

    eventData.numberOfRegistered++;
    if (eventData.capacity <= eventData.numberOfRegistered) {
      eventData.status = "closed";
      await handleCreateGroupChatForEvent(eventData.eventId, eventData.eventName, eventData.type, t);
    }
    await eventData.save({ transaction: t });

    if (req?.audit) {
      req.audit.affectedUser = { _id: userId };
      req.audit.affectedThing = { _id: eventData.eventId, name: eventData.eventName };
      req.audit.message = "Exam event reserved successfully | تم حجز حدث الامتحان بنجاح";
    }

    return {
      message: `Reserved event successfully with ${examReservations.length} exam(s).`,
      data: { reservation: newReservation, examReservations },
    };
  });
};
const registerForTraining = async (userId, eventId, req) => {
  return sequelize.transaction(async (t) => {
    const eventData = await event.findOne({
      where: { eventId, type: "training" },
      transaction: t,
    });

    if (!eventData) throw new Error("Training event not found");

    if (eventData.status === "closed") {
      throw new Error("You can't reserve a closed training");
    }

    const trainings = await training.findAll({
      where: { eventId },
      transaction: t,
    });

    if (!trainings.length)
      throw new Error("No training sessions found for this event");

    const trainingIds = trainings.map((tr) => tr.trainingId);

    const previousReservations = await trainingReservation.findAll({
      where: { userId, trainingId: trainingIds },
      transaction: t,
    });

    if (previousReservations.length > 0) {
      const hasNonFinished = previousReservations.some(
        (r) => r.trainigStatus?.toLowerCase() !== "finshed",
      );

      if (hasNonFinished) {
        throw new Error(
          "You cannot reserve this training again until previous sessions are finished.",
        );
      }
    }

    const userReservations = await reservation.findAll({
      include: [
        {
          model: event,
          as: "reservationEvent",
          attributes: ["eventId", "startDate", "endDate", "type"],
        },
      ],
      where: { userId },
      transaction: t,
    });

    for (let res of userReservations) {
      const ev = res.reservationEvent;
      if (!ev) continue;

      const overlap =
        eventData.startDate < ev.endDate && ev.startDate < eventData.endDate;

      if (overlap) {
        throw new Error("reservation_overlaps_with_event");
      }
    }

    const newReservation = await reservation.create(
      { userId, eventId },
      { transaction: t },
    );

    const student = await Student.findOne({ where: { userId } });
    if (student) {
      student.status = "reserved Training";
      await student.save({ transaction: t });
    }

    const trainingReservations = trainings.map((tr) => ({
      reservationId: newReservation.reservationId,
      userId,
      trainingId: tr.trainingId,
      type: "training",
      reservationStatus: "reserved",
      trainigStatus: "ACTIVE",
    }));

    await trainingReservation.bulkCreate(trainingReservations, {
      transaction: t,
    });

    eventData.numberOfRegistered += 1;

    if (eventData.numberOfRegistered >= eventData.capacity) {
      eventData.status = "closed";
      await handleCreateGroupChatForEvent(
        eventData.eventId,
        eventData.eventName,
        "training",
        t,
      );
    }

    await eventData.save({ transaction: t });

    if (req && req.audit) {
      req.audit.affectedUser = {
        _id: userId,
      };
      req.audit.affectedThing = {
        _id: eventData.eventId,
        name: eventData.eventName,
      };
      req.audit.message =
        "Training event reserved successfully | تم حجز حدث التدريب بنجاح";
    }

    return {
      message: `Training reserved successfully for ${trainingReservations.length} session(s).`,
      data: {
        reservation: newReservation,
        trainingReservations,
      },
    };
  });
};

const getUserActiveReservations = async (userId) => {
  const student = await Student.findOne({ where: { userId } });
  if (!student) throw new Error("Student not found");

  const userReservations = await reservation.findAll({
    where: { userId },
    include: [
      {
        model: event,
        as: "reservationEvent",
        attributes: ["eventId", "eventName", "startDate", "endDate", "type"],
        include: [
          {
            model: exam,
            include: [
              {
                model: examReservation,
                where: { userId, reservationStatus: "reserved" },
                required: false,
              },
            ],
            required: false,
          },

          {
            model: training,
            as: "trainings",
            include: [
              {
                model: trainingReservation,
                where: { userId, trainigStatus: { [Op.not]: "finshed" } },
                required: false,
              },
            ],
            required: false,
          },
        ],
      },
    ],
  });

  // Filter out reservations that have no active exams or trainings
  // const activeReservations = userReservations.filter((res) => {
  //   const ev = res.reservationEvent;
  //   if (!ev) return false;

  //   const hasPendingExam =
  //     ev.exams?.some((ex) => ex.examReservations?.length > 0) ?? false;

  //   const hasPendingTraining =
  //     ev.trainings?.some((tr) => tr.trainingReservations?.length > 0) ?? false;

  //   return hasPendingExam || hasPendingTraining;
  // });

  // return activeReservations;
  return userReservations;
};
module.exports = {
  registerForExam,
  registerForTraining,
  getUserActiveReservations,
};
