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
} = require("../../../models");
// const Student = require("../../../models/Student");
const { Op } = require("sequelize");
const chattingService = require("../../../Services/chattingService");

const registerForExam = async (userId, eventId) => {
  return sequelize.transaction(async (t) => {
    const eventData = await event.findOne({
      where: { eventId },
      transaction: t,
    });

    if (!eventData) throw new Error("Event not found");
    if (eventData.capacity <= eventData.numberOfRegistered) {
      eventData.status = "closed";
      await eventData.save();
      throw new Error("Can not register for this event");
    }

    let examsToReserve = [];

    const eventExams = await exam.findAll({
      where: { eventId },
      transaction: t,
    });

    if (eventExams && eventExams.length > 0) {
      examsToReserve.push(...eventExams);
    } else if (eventData.packageId) {
      const packageCourses = await packageCourse.findAll({
        where: { packageId: eventData.packageId },
        include: [{ model: course }],
        transaction: t,
      });

      if (packageCourses.length > 0) {
        const courseIds = packageCourses.map((pc) => pc.courseId);

        const packageExams = await exam.findAll({
          where: { courseId: courseIds },
          transaction: t,
        });

        examsToReserve = packageExams;
      }
    } else if (eventData.productId) {
      const productExams = await exam.findAll({
        where: {
          courseId: sequelize.literal(
            `course."productId" = '${eventData.productId}'`
          ),
        },
        transaction: t,
      });

      examsToReserve = productExams;
    }

    if (examsToReserve.length === 0)
      throw new Error("No exams found for this event or package.");

    const examIds = examsToReserve.map((ex) => ex.examId);

    const previousReservations = await examReservation.findAll({
      where: { userId, examId: examIds },
      transaction: t,
    });

    if (previousReservations.length > 0) {
      const hasNonFailResult = previousReservations.some(
        (r) => r.result !== "fail"
      );

      if (hasNonFailResult) {
        throw new Error(
          "You cannot reserve this event again until all your previous exam results are 'fail'."
        );
      }
    }

    const userReservations = await reservation.findAll({
      where: { userId },
      include: [
        {
          model: event,
          as: "reservationEvent",
          attributes: ["eventId", "startDate", "endDate", "type"],
        },
      ],
      transaction: t,
    });

    for (let res of userReservations) {
      const existingEvent = res.reservationEvent;
      if (!existingEvent) continue;

      const overlap =
        eventData.startDate < existingEvent.endDate &&
        existingEvent.startDate < eventData.endDate;

      if (overlap) {
        throw new Error(
          `You already have a reservation (${existingEvent.type}) that overlaps with this event.`
        );
      }
    }

    const newReservation = await reservation.create(
      { userId, eventId },
      { transaction: t }
    );

    const examReservations = examsToReserve.map((ex) => ({
      reservationId: newReservation.reservationId,
      userId,
      examId: ex.examId,
      type: "exam",
      reservationStatus: "reserved",
    }));
    const student = await Student.findOne({ where: { userId } });
    if (student) {
      student.status = "reserved Exam";
      await student.save({ transaction: t });
    }

    await examReservation.bulkCreate(examReservations, { transaction: t });
    eventData.numberOfRegistered++;
    await eventData.save();
    return {
      message: `Reserved event successfully with ${examReservations.length} exam(s).`,
      data: {
        reservation: newReservation,
        examReservations,
      },
    };
  });
};

const registerForTraining = async (userId, eventId) => {
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
        (r) => r.trainigStatus?.toLowerCase() !== "finshed"
      );

      if (hasNonFinished) {
        throw new Error(
          "You cannot reserve this training again until previous sessions are finished."
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
        throw new Error(
          `You already have a reservation (${ev.type}) that overlaps with this event.`
        );
      }
    }

    const newReservation = await reservation.create(
      { userId, eventId },
      { transaction: t }
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

      const allReservations = await reservation.findAll({
        where: { eventId: eventData.eventId },
        attributes: ["userId"],
        transaction: t,
      });

      const userIds = allReservations.map((r) => r.userId);

      const trainings = await training.findAll({
        where: { eventId: eventData.eventId },
        attributes: ["trainerId"],
        transaction: t,
      });

      const trainerIds = trainings
        .map((t) => t.trainerId)
        .filter((id) => id !== null);

      const finalGroupMembers = [...new Set([...trainerIds, ...userIds])];

      await chattingService.createGroupConversation(
        finalGroupMembers,
        eventData.eventId,
        eventData.eventName
      );
    }

    await eventData.save({ transaction: t });

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
