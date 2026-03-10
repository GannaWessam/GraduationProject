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

   // ✅ Compare course lists
  const packageCourseIds = pkg.courses.map((c) => c.courseId);
  const requestCourseIds = trainingData.courses.map((c) => c.courseId);

  const missing = packageCourseIds.filter(
    (id) => !requestCourseIds.includes(id),
  );
  const extra = requestCourseIds.filter((id) => !packageCourseIds.includes(id));

  if (missing.length > 0)
    throw new Error("missing_courses_from_package");
  if (extra.length > 0)
    throw new Error("extra_courses_not_in_package");

  let createNewEventDespiteTheSameData = true;
  for (let i = 0; i < pkg.courses.length; i++) {
    trainingData.courseId = trainingData.courses[i].courseId;
    trainingData.trainerId = trainingData.courses[i].trainerId;
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
      language: trainingData.language || "AR" // Default to Arabic if not provided
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
      {
        model:course,
        attributes:["name"]
      }
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

    const trainingg = await training.findByPk(trainingId, { transaction: t });
    if (!trainingg) throw new Error("training_not_found");

    // Validate Course
    if (updateData.courseId) {
      const coursee = await course.findByPk(updateData.courseId, { transaction: t });
      if (!coursee) throw new Error("course_not_found");
    }

    // Validate Trainer
    if (updateData.trainerId) {
      const trainerExist = await trainer.findByPk(updateData.trainerId, { transaction: t });
      if (!trainerExist) throw new Error("trainer_not_found");
    }

    await trainingg.update({
      courseId: updateData.courseId ?? trainingg.courseId,
      trainerId: updateData.trainerId ?? trainingg.trainerId
    }, { transaction: t });

    return trainingg;
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
};
