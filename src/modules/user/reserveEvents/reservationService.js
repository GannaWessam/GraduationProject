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
} = require("../../../models");

const registerForExam = async (userId, eventId) => {
  return sequelize.transaction(async (t) => {
    const eventData = await event.findOne({
      where: { eventId },
      transaction: t,
    });

    if (!eventData) throw new Error("Event not found");

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

    await examReservation.bulkCreate(examReservations, { transaction: t });

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

    const trainings = await training.findAll({
      where: { eventId },
      transaction: t,
    });

    if (!trainings || trainings.length === 0)
      throw new Error("No training sessions found for this event");

    const trainingIds = trainings.map((tr) => tr.trainingId);
    const previousReservations = await trainingReservation.findAll({
      where: { userId, trainingId: trainingIds },
      transaction: t,
    });

    if (previousReservations.length > 0) {
      const hasNonFail = previousReservations.some(
        (r) => r.trainigStatus && r.trainigStatus.toLowerCase() !== "fail"
      );

      if (hasNonFail) {
        throw new Error(
          "You cannot reserve this training again until all your previous training results are marked as 'fail'."
        );
      }
    }

    const newReservation = await reservation.create(
      { userId, eventId },
      { transaction: t }
    );

    const trainingReservations = trainings.map((tr) => ({
      reservationId: newReservation.reservationId,
      userId,
      trainingId: tr.trainingId,
      type: "training",
      reservationStatus: "reserved",
      trainigStatus: "pending",
    }));

    await trainingReservation.bulkCreate(trainingReservations, {
      transaction: t,
    });

    return {
      message: `Training reserved successfully for ${trainingReservations.length} session(s).`,
      data: {
        reservation: newReservation,
        trainingReservations,
      },
    };
  });
};

module.exports = { registerForExam, registerForTraining };
