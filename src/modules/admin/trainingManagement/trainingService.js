const { training, course, User, event, trainingReservation, sequelize } = require("../../../models/index.js");
const ApiFeature = require("../../../Util/ApiFeatures");
const PaginatedResponse = require("../../../Util/PaginatedResponse");
const {validateUpdateEvent} = require("../examManagment/helpers/examValidation.js")

const createTraining = async (trainingData) => {
  if (!trainingData.startDate || !trainingData.endDate) {
    throw new Error("startDate and endDate are required");
  }

  return sequelize.transaction(async (t) => {
    // Validate course exists *if provided*
    if (trainingData.courseId) {
      const course = await course.findByPk(trainingData.courseId, { transaction: t });
      if (!course) {
        throw new Error("course_not_found");
      }
    }
    if (trainingData.trainerId) {
      const trainer = await User.findByPk(trainingData.trainerId, { transaction: t });
      if (!trainer) {
        throw new Error("trainer_not_found");
      }
    }

    const eventData = {
      startDate: trainingData.startDate,
      endDate: trainingData.endDate,
      capacity: trainingData.capacity,
      numberOfRegistered: 0,
      status: 'opend',
      type: 'training'
    };

    const event = await event.create(eventData, { transaction: t });

    // Create the training linked to the event
    const training = await training.create({
      courseId: trainingData.courseId,
      trainerId: trainingData.trainerId,
      eventId: event.eventId
    }, { transaction: t });
    
    return { trainingId: training.trainingId };
  });
};

const getTrainingById = async (trainingId) => {
  const training = await training.findByPk(trainingId, {
    include: [
      { model: course, attributes: ['name'] },
      { model: User, as: 'trainer', attributes: ['email'] },
      { model: event, attributes: ['eventId', 'startDate', 'endDate', 'capacity', 'numberOfRegistered', 'status', 'type'] }
    ]
  });

  if (!training) {
    throw new Error("training_not_found");
  }

  return training;
};

const getAllTrainings = async (features) => {
  const { count, rows: trainings } = await training.findAndCountAll({
    ...features.options,
    include: [
      { model: course, attributes: ['name'] },
      { model: User, as: 'trainer', attributes: ['userId', 'email'] },
      { model: event, attributes: ['eventId', 'startDate', 'endDate', 'capacity', 'numberOfRegistered', 'status', 'type'] }
    ]
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
    const training = await training.findByPk(trainingId, { 
      include: [{ model: event }],
      transaction: t 
    });

    if (!training) {
      throw new Error("training_not_found");
    }

    // lw ba3t course id at'ked eno mwgod
    if (updateData.courseId) {
      const course = await course.findByPk(updateData.courseId, { transaction: t });
      if (!course) {
        throw new Error("course_not_found");
      }
    }

    // lw ba3t trainer id at'ked eno mwgod
    if (updateData.trainerId) {
      const trainer = await User.findByPk(updateData.trainerId, { transaction: t });
      if (!trainer) {
        throw new Error("trainer_not_found");
      }
    }

    await training.update(updateData, { transaction: t });

    // Update associated event if event data is provided
    const eventData = validateUpdateEvent(updateData);
    if (eventData) {
      await training.event.update(eventUpdateData, { transaction: t });
    }
    return { trainingId: training.trainingId };
  });
};


const deleteTraining = async (trainingId) => {
  return sequelize.transaction(async (t) => {
    const training = await training.findByPk(trainingId, { 
      include: [{ model: event }],
      transaction: t 
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
    transaction: t 
  });

  if (!training) {
    throw new Error("training_not_found");
  }

  const { count, rows: reservations } = await trainingReservation.findAndCountAll({
    ...features.options,
    where: { trainingId },
    include: [
      { model: User, attributes: ['userId', 'email'] }
    ]
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
  getTrainingReservations
};
