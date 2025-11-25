const {
  training,
  course,
  User,
  event,
  trainingReservation,
  sequelize,
  trainer,
} = require("../../../models/index.js");
const { sendNotificationToUsers } = require("../../../Services/pushService.js");
const ApiFeature = require("../../../Util/ApiFeatures");
const PaginatedResponse = require("../../../Util/PaginatedResponse");
const {
  validateUpdateEvent,
} = require("../examManagment/helpers/examValidation.js");
const {
  getEligibleUserIdsForEvent,
} = require("../examManagment/helpers/sendNotification.js");
const ws = require("../../../Services/WebSocket");
const packageService = require("../../admin/packageManagement/packageService.js");
const { where } = require("sequelize");

const createTraining = async (trainingData) => {
  if (trainingData.packageId) await createTrainingPackage(trainingData);
  else if (trainingData.courseId) await createOneTraining(trainingData, true);
  else throw new Error("packageId or courseId is required");
};

const createTrainingPackage = async (trainingData) => {
  const pkg = await packageService.getPackageById(trainingData.packageId);
  if (!pkg) throw new Error("package_not_found");
  let createNewEventDespiteTheSameData = true;
  for (let i = 0; i < pkg.courses.length; i++) {
    trainingData.courseId = pkg.courses[i].courseId;
    await createOneTraining(trainingData, createNewEventDespiteTheSameData);
    createNewEventDespiteTheSameData = false;
  }
};
const createOneTraining = async (
  trainingData,
  createNewEventDespiteTheSameData
) => {
  if (!trainingData.startDate || !trainingData.endDate) {
    throw new Error("startDate and endDate are required");
  }

  return sequelize.transaction(async (t) => {
    // Validate course exists *if provided*
    if (trainingData.courseId) {
      const coursee = await course.findByPk(trainingData.courseId, {
        transaction: t,
      });
      if (!coursee) {
        throw new Error("course_not_found");
      }
    }
    if (trainingData.trainerId) {
      const trainer = await User.findByPk(trainingData.trainerId, {
        transaction: t,
      });
      if (!trainer) {
        throw new Error("trainer_not_found");
      }
    }

    const eventData = {
      startDate: trainingData.startDate,
      endDate: trainingData.endDate,
      capacity: trainingData.capacity,
      numberOfRegistered: 0,
      eventName: trainingData.eventName,
      packageId: trainingData.packageId, // 3ady lw mb3tosh - by allow null
      productId: trainingData.productId || null, // لازم يكون موجود في جدول product
      startDateRes: trainingData.startDateRes,
      endDateRes: trainingData.endDateRes,
      status: "opend",
      type: "training",
    };
    let eventt;
    if (createNewEventDespiteTheSameData) {
      eventt = await event.findOne({
        where: {
          eventName: trainingData.eventName,
          type: "training",
        },
        transaction: t,
      });
      if (eventt)
        throw new Error("there is alraedy training with the same name");
      eventt = await event.create(eventData, { transaction: t });
    } else {
      eventt = await event.findOne({
        where: {
          //     startDate: trainingData.startDate,
          // endDate: trainingData.endDate,
          capacity: trainingData.capacity,
          numberOfRegistered: 0,
          eventName: trainingData.eventName,
          packageId: trainingData.packageId, // 3ady lw mb3tosh - by allow null
          productId: trainingData.productId || null, // لازم يكون موجود في جدول product
          // startDateRes: trainingData.startDateRes,
          // endDateRes: trainingData.endDateRes,
          status: "opend",
          type: "training",
        },
        transaction: t,
      });
    }
    // Create the training linked to the event
    const trainingg = await training.create(
      {
        courseId: trainingData.courseId,
        trainerId: trainingData.trainerId,
        eventId: eventt.dataValues.eventId,
      },
      { transaction: t }
    );

    //   const userIds = await getEligibleUserIdsForEvent(eventt.dataValues.eventId);
    // if (userIds.length === 0) return { message: "No eligible users found" };

    // const results = await sendNotificationToUsers(userIds, payload);
    // await sendNotificationToUser(userId,payload)
    ws.notifyClients("new event has been opend", "newEvent");

    return { trainingId: trainingg.dataValues.trainingId };
  });
};

const getTrainingById = async (trainingId) => {
  const trainingg = await training.findByPk(trainingId, {
    include: [
      { model: course, attributes: ["name"] },
      { model: trainer, as: "trainer", attributes: ["Name"] },
      {
        model: event,
        attributes: [
          "startDate",
          "endDate",
          "capacity",
          "numberOfRegistered",
          "status",
        ],
      },
    ],
  });

  if (!trainingg) {
    throw new Error("training_not_found");
  }

  return trainingg;
};

const getAllTrainings = async (features) => {
  const { count, rows: trainings } = await training.findAndCountAll({
    ...features.options,
    include: [
      {
        model: event,
        as: "event",
        attributes: [
          "startDate",
          "eventName",
          "endDate",
          "startDateRes",
          "endDateRes",
          "capacity",
          "numberOfRegistered",
          "status",
        ],
      },
    ],
  });

  if (!trainings) {
    throw new Error("no_trainings_found");
  }

  return PaginatedResponse.fromApiFeature(
    features,
    count,
    trainings,
    "Trainings fetched successfully"
  );
};

const updateTraining = async (trainingId, updateData) => {
  return sequelize.transaction(async (t) => {
    const trainingg = await training.findByPk(trainingId, {
      include: [{ model: event ,as: 'event'}],
      transaction: t,
    });

    if (!trainingg) {
      throw new Error("training_not_found");
    }

    // lw ba3t course id at'ked eno mwgod
    if (updateData.courseId) {
      const coursee = await course.findByPk(updateData.courseId, {
        transaction: t,
      });
      if (!coursee) {
        throw new Error("course_not_found");
      }
    }

    // lw ba3t trainer id at'ked eno mwgod
    if (updateData.trainerId) {
      const trainer = await User.findByPk(updateData.trainerId, {
        transaction: t,
      });
      if (!trainer) {
        throw new Error("trainer_not_found");
      }
    }

    await trainingg.update(updateData, { transaction: t });

    // Update associated event if event data is provided
    const eventData = validateUpdateEvent(updateData);
    if (eventData) {
      await trainingg.event.update(eventData, { transaction: t });
    }
    return { trainingId: trainingg.trainingId };
  });
};


const updateTrainingEvent = async (eventId, updateData) => {
  return await sequelize.transaction(async (t) => {

    // ============================
    // (1) هات ال event
    // ============================
    const eventt = await event.findByPk(eventId, { transaction: t });
    if (!eventt) throw new Error("event_not_found");

    // ============================
    // (2) Update event fields (لو مبعوتة)
    // ============================
    const eventFields = [
      "startDate",
      "endDate",
      "startDateRes",
      "endDateRes",
      "capacity",
      "status"
    ];

    let eventModified = false;

    eventFields.forEach(field => {
      if (updateData[field] !== undefined) {
        eventt[field] = updateData[field];
        eventModified = true;
      }
    });

    if (eventModified) {
      await eventt.save({ transaction: t });
    }

    // ============================
    // (3) لو مفيش trainerId → رجع event وخلاص
    // ============================
    if (updateData.trainerId === undefined || updateData.trainerId === null) {
      return {
        updatedEvent: eventt,
        updatedTrainings: []
      };
    }

    // ============================
    // (4) Validate trainer exists
    // ============================
    const trainer = await User.findByPk(updateData.trainerId, {
      transaction: t
    });
    if (!trainer) throw new Error("trainer_not_found");

    // ============================
    // (5) هات كل trainings اللي تبع event دا
    // ============================
    const trainings = await training.findAll({
      where: { eventId },
      transaction: t
    });

    if (trainings.length > 0) {
      // ============================
      // (6) Update trainerId لكل trainings
      // ============================
      await training.update(
        { trainerId: updateData.trainerId },
        { where: { eventId }, transaction: t }
      );
    }

    return {
      updatedEvent: eventt,
      updatedTrainings: await training.findAll({ where: { eventId }, transaction: t })
    };
  });
};

const deleteTraining = async (trainingId) => {
  return sequelize.transaction(async (t) => {
    const training = await training.findByPk(trainingId, {
      include: [{ model: event }],
      transaction: t,
    });

    if (!training) {
      throw new Error("training_not_found");
    }

    // Delete associated event first
    await training.event.destroy({ transaction: t });

    await training.destroy({ transaction: t });

    return { message: "Training deleted successfully" };
  });
};

// Get specific training reservations (students connected to training)
const getTrainingReservations = async (trainingId, features) => {
  const training = await training.findByPk(trainingId, {
    include: [{ model: event }],
    transaction: t,
  });

  if (!training) {
    throw new Error("training_not_found");
  }

  const { count, rows: reservations } =
    await trainingReservation.findAndCountAll({
      ...features.options,
      where: { trainingId },
      include: [{ model: User, attributes: ["userId", "email"] }],
    });

  if (!reservations || reservations.length === 0) {
    throw new Error("no_reservations_found_for_training");
  }

  return PaginatedResponse.fromApiFeature(
    features,
    count,
    reservations,
    "Training reservations fetched successfully"
  );
};

module.exports = {
  createTraining,
  getTrainingById,
  getAllTrainings,
  updateTraining,
  deleteTraining,
  getTrainingReservations,
  updateTrainingEvent

};
