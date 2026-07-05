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
  studentCourse,
  Product,
  systemdata,
  Conversation,
  ConversationUser
} = require("../../../models");
// const Student = require("../../../models/Student");
const { Op } = require("sequelize");
const { handleCreateGroupChatForEvent } = require("./helpers/helper");

const registerForExam = async (userId, eventId, req) => {
  return sequelize.transaction(async (t) => {
    const doneCoursesBefore = await studentCourse.count({
      where: {
        userId,
        examStatus: {
          [Op.ne]: "pending",
        },
      },
      transaction: t,
    });

    const eventData = await event.findOne({
      where: { eventId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!eventData) throw new Error("Event not found");
    if (eventData.capacity <= eventData.numberOfRegistered) {
      eventData.status = "closed";
      await eventData.save({ transaction: t });
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
    const courseIds = examsToReserve.map((ex) => ex.courseId);
    const studentCourses = await studentCourse.findAll({
      where: { userId, courseId: courseIds },
      transaction: t,
    });

    const sd = await systemdata.findOne();

    const exceededCourses = studentCourses
      .filter((sc) => sc.attempts >= sd.numberOfAttemptsAvailableToReexam)
      .map((sc) => sc.courseId);

    if (exceededCourses.length > 0) {
      throw new Error(
        `You cannot reserve exams for these courses anymore (attempts >= 4)`
      );
    }

    const previousReservations = await examReservation.findAll({
      where: { userId },
      include: [
        {
          model: exam,
          where: {
            courseId: courseIds,
          },
          attributes: ["courseId"],
        },
      ],
      order: [["createdAt", "DESC"]],
      transaction: t,
    });
    const latestReservationsByCourse = {};

    for (const r of previousReservations) {
      const courseId = r.exam.courseId;

      if (!latestReservationsByCourse[courseId]) {
        latestReservationsByCourse[courseId] = r;
      }
    }
    const hasNonFailLatest = Object.values(latestReservationsByCourse).some(
      (r) => r.reservationStatus !== "failed"
    );

    if (hasNonFailLatest) {
      throw new Error(
        "You cannot reserve this event again until your latest exam result is 'failed'."
      );
    }

    // const userReservations = await reservation.findAll({
    //   where: { userId },
    //   include: [
    //     {
    //       model: event,
    //       as: "reservationEvent",
    //       attributes: ["eventId", "startDate", "endDate", "type"],
    //     },
    //   ],
    //   transaction: t,
    // });

    // for (let res of userReservations) {
    //   const existingEvent = res.reservationEvent;
    //   if (!existingEvent) continue;

    //   const overlap =
    //     eventData.startDate < existingEvent.endDate &&
    //     existingEvent.startDate < eventData.endDate;

    //   if (overlap) {
    //     throw new Error("reservation_overlaps_with_event");
    //   }
    // }

    const newReservation = await reservation.create(
      { userId, eventId },
      { transaction: t }
    );
    const student = await Student.findOne({ where: { userId } });

    const productData = await Product.findOne({
      where: { productId: student.productId },
      attributes: ["requirdCourses"],
      transaction: t,
    });

    if (!productData) throw new Error("Product not found");

    const requiredCourses = productData.requirdCourses;

    const examReservations = examsToReserve.map((ex) => ({
      reservationId: newReservation.reservationId,
      userId,
      examId: ex.examId,
      type: "exam",
      reservationStatus: "reserved",
    }));

    if (student) {
      const hasFailedBefore = previousReservations.some(
        (r) => r.reservationStatus === "failed"
      );

      if (hasFailedBefore) {
        student.status = "reserved Reexam";
      } else {
        student.status = "reserved Exam";
      }

      await student.save({ transaction: t });
    }

    await examReservation.bulkCreate(examReservations, { transaction: t });
    for (const ex of examsToReserve) {
      const sc = studentCourses.find((sc) => sc.courseId === ex.courseId);
      if (sc) {
        sc.attempts += 1;
        await sc.save({ transaction: t });
      } else {
        await studentCourse.create(
          {
            userId,
            courseId: ex.courseId,
            attempts: 1,
          },
          { transaction: t }
        );
      }
    }
    eventData.numberOfRegistered++;
    await eventData.save({ transaction: t });

    if (eventData.capacity <= eventData.numberOfRegistered) {
      eventData.status = "closed";
      await eventData.save({ transaction: t });
      t.afterCommit(() => {
        handleCreateGroupChatForEvent(
          eventData.eventId,
          eventData.eventName,
          eventData.type
        ).catch((err) => {
          console.error("Group chat creation failed:", err);
        });
      });
    }
    await studentCourse.update(
      { examStatus: "done" },
      {
        where: {
          userId,
          courseId: courseIds,
        },
        transaction: t,
      }
    );

    const doneNow = courseIds.length;

    const totalDone = doneCoursesBefore + doneNow;
    if (totalDone >= requiredCourses) {
      await studentCourse.update(
        { examStatus: "unavailable" },
        {
          where: {
            userId,
            examStatus: "pending",
          },
          transaction: t,
        }
      );
    }

    if (req && req.audit) {
      req.audit.user = {
        _id: userId,
        name:student ? student.fullName : null,
      };
      req.audit.affectedThing = {
        _id: eventData.eventId,
        name: eventData.eventName,
      };
      req.audit.message =
        "Exam event reserved successfully | تم حجز حدث الامتحان بنجاح";
    }

    return {
      message: `Reserved event successfully with ${examReservations.length} exam(s).`,
      data: {
        reservation: newReservation,
        examReservations,
      },
    };
  });
};

const registerForTraining = async (userId, eventId, req) => {
  return sequelize.transaction(async (t) => {
    const eventData = await event.findOne({
      where: { eventId, type: "training" },
      transaction: t,
      lock: t.LOCK.UPDATE,
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

    const courseIds = trainings.map((tr) => tr.courseId);

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

    // const userReservations = await reservation.findAll({
    //   include: [
    //     {
    //       model: event,
    //       as: "reservationEvent",
    //       attributes: ["eventId", "startDate", "endDate", "type"],
    //     },
    //   ],
    //   where: { userId },
    //   transaction: t,
    // });

    // for (let res of userReservations) {
    //   const ev = res.reservationEvent;
    //   if (!ev) continue;

    //   const overlap =
    //     eventData.startDate < ev.endDate && ev.startDate < eventData.endDate;

    //   if (overlap) {
    //     throw new Error("reservation_overlaps_with_event");
    //   }
    // }

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
      t.afterCommit(() => {
        handleCreateGroupChatForEvent(
          eventData.eventId,
          eventData.eventName,
          "training",
        ).catch((err) => {
          console.error("Group chat creation failed:", err);
        });
      });
    }
    await studentCourse.update(
      { trainingStatus: "reserved" },
      {
        where: {
          userId,
          courseId: courseIds,
        },
        transaction: t,
      }
    );
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

const registerForExamBySuperAdmin = async (userId, eventId, req) => {
  return sequelize.transaction(async (t) => {
    const doneCoursesBefore = await studentCourse.count({
      where: {
        userId,
        examStatus: {
          [Op.ne]: "pending",
        },
      },
      transaction: t,
    });

    const eventData = await event.findOne({
      where: { eventId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!eventData) throw new Error("Event not found");

    const systemData = await systemdata.findOne({ transaction: t });

    if (
      eventData.numberOfRegistered >=
      eventData.capacity + systemData.limitToAttachUserToEvent
    ) {
        throw new Error("Event attachment limit exceeded");
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
    const courseIds = examsToReserve.map((ex) => ex.courseId);
    const studentCourses = await studentCourse.findAll({
      where: { userId, courseId: courseIds },
      transaction: t,
    });

    const sd = await systemdata.findOne();

    const exceededCourses = studentCourses
      .filter((sc) => sc.attempts >= sd.numberOfAttemptsAvailableToReexam)
      .map((sc) => sc.courseId);

    if (exceededCourses.length > 0) {
      throw new Error(
        `You cannot reserve exams for these courses anymore (attempts >= 4)`
      );
    }

    const previousReservations = await examReservation.findAll({
      where: { userId },
      include: [
        {
          model: exam,
          where: {
            courseId: courseIds,
          },
          attributes: ["courseId"],
        },
      ],
      order: [["createdAt", "DESC"]],
      transaction: t,
    });
    const latestReservationsByCourse = {};

    for (const r of previousReservations) {
      const courseId = r.exam.courseId;

      if (!latestReservationsByCourse[courseId]) {
        latestReservationsByCourse[courseId] = r;
      }
    }
    const hasNonFailLatest = Object.values(latestReservationsByCourse).some(
      (r) => r.reservationStatus !== "failed"
    );

    if (hasNonFailLatest) {
      throw new Error(
        "You cannot reserve this event again until your latest exam result is 'failed'."
      );
    }


    const newReservation = await reservation.create(
      { userId, eventId },
      { transaction: t }
    );
    const student = await Student.findOne({ where: { userId } });

    const productData = await Product.findOne({
      where: { productId: student.productId },
      attributes: ["requirdCourses"],
      transaction: t,
    });

    if (!productData) throw new Error("Product not found");

    const requiredCourses = productData.requirdCourses;

    const examReservations = examsToReserve.map((ex) => ({
      reservationId: newReservation.reservationId,
      userId,
      examId: ex.examId,
      type: "exam",
      reservationStatus: "reserved",
    }));

    if (student) {
      const hasFailedBefore = previousReservations.some(
        (r) => r.reservationStatus === "failed"
      );

      if (hasFailedBefore) {
        student.status = "reserved Reexam";
      } else {
        student.status = "reserved Exam";
      }

      await student.save({ transaction: t });
    }

    await examReservation.bulkCreate(examReservations, { transaction: t });
    for (const ex of examsToReserve) {
      const sc = studentCourses.find((sc) => sc.courseId === ex.courseId);
      if (sc) {
        sc.attempts += 1;
        await sc.save({ transaction: t });
      } else {
        await studentCourse.create(
          {
            userId,
            courseId: ex.courseId,
            attempts: 1,
          },
          { transaction: t }
        );
      }
    }
    eventData.numberOfRegistered++;
    await eventData.save({ transaction: t });

    const conversation = await Conversation.findOne({
      where: { eventId },
      transaction: t,
    });
    
    if (conversation) {
      const conversationUser = await ConversationUser.findOne({
        where: {
          conversationId: conversation.conversationId,
          userId,
        },
        transaction: t,
      });
    
      if (!conversationUser) {
        await ConversationUser.create(
          {
            conversationId: conversation.conversationId,
            userId,
          },
          { transaction: t }
        );
      }
    }

    if (eventData.capacity === eventData.numberOfRegistered) {
      eventData.status = "closed";
      await eventData.save({ transaction: t });
      t.afterCommit(() => {
        handleCreateGroupChatForEvent(
          eventData.eventId,
          eventData.eventName,
          eventData.type
        ).catch((err) => {
          console.error("Group chat creation failed:", err);
        });
      });
    }
    

    await studentCourse.update(
      { examStatus: "done" },
      {
        where: {
          userId,
          courseId: courseIds,
        },
        transaction: t,
      }
    );

    const doneNow = courseIds.length;

    const totalDone = doneCoursesBefore + doneNow;
    if (totalDone >= requiredCourses) {
      await studentCourse.update(
        { examStatus: "unavailable" },
        {
          where: {
            userId,
            examStatus: "pending",
          },
          transaction: t,
        }
      );
    }

    if (req && req.audit) {
      req.audit.user = {
        _id: req.userData.id,
        name: req.userData.name || null,
      };
      req.audit.affectedThing = {
        _id: eventData.eventId,
        name: eventData.eventName,
      };
      req.audit.affectedUser = {
        _id: userId,
        name:student ? student.fullName : null,
      };
      req.audit.message =
      "Exam event reserved successfully by Super Admin | تم حجز حدث الامتحان بنجاح بواسطة المدير العام";;
    }

    return {
      message: `Reserved event successfully with ${examReservations.length} exam(s).`,
      data: {
        reservation: newReservation,
        examReservations,
      },
    };
  });
};

const registerForTrainingBySuperAdmin = async (userId, eventId, req) => {
  return sequelize.transaction(async (t) => {
    const eventData = await event.findOne({
      where: { eventId, type: "training" },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!eventData) throw new Error("Training event not found");

    const systemData = await systemdata.findOne({ transaction: t });

    if (
      eventData.numberOfRegistered >=
      eventData.capacity + systemData.limitToAttachUserToEvent
    ) {
        throw new Error("Event attachment limit exceeded")
    }

    

    const trainings = await training.findAll({
      where: { eventId },
      transaction: t,
    });

    if (!trainings.length)
      throw new Error("No training sessions found for this event");

    const courseIds = trainings.map((tr) => tr.courseId);

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

    const conversation = await Conversation.findOne({
      where: { eventId },
      transaction: t,
    });
    
    if (conversation) {
      const conversationUser = await ConversationUser.findOne({
        where: {
          conversationId: conversation.conversationId,
          userId,
        },
        transaction: t,
      });
    
      if (!conversationUser) {
        await ConversationUser.create(
          {
            conversationId: conversation.conversationId,
            userId,
          },
          { transaction: t }
        );
      }
    }
    if (eventData.capacity === eventData.numberOfRegistered) {
      eventData.status = "closed";
      await eventData.save({ transaction: t });
      t.afterCommit(() => {
        handleCreateGroupChatForEvent(
          eventData.eventId,
          eventData.eventName,
          eventData.type
        ).catch((err) => {
          console.error("Group chat creation failed:", err);
        });
      });
    }
    
    await studentCourse.update(
      { trainingStatus: "reserved" },
      {
        where: {
          userId,
          courseId: courseIds,
        },
        transaction: t,
      }
    );
    await eventData.save({ transaction: t });

    if (req && req.audit) {
      req.audit.user = {
        _id: req.userData.id,
        name: req.userData.name || null,
      };
      req.audit.affectedThing = {
        _id: eventData.eventId,
        name: eventData.eventName,
      };
      req.audit.affectedUser = {
        _id: userId,
        name:student ? student.fullName : null,
      };
      req.audit.message =
        "Training event reserved successfully by Super Admin | تم حجز حدث التدريب بنجاح بواسطة المدير العام";
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

module.exports = {
  registerForExam,
  registerForTraining,
  getUserActiveReservations,
  registerForExamBySuperAdmin,
  registerForTrainingBySuperAdmin
};
