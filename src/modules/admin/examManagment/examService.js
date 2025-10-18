const { exam, course, User, event, examReservation, sequelize, Student} = require("../../../models/index.js");
const ApiFeature = require("../../../Util/ApiFeatures");
const PaginatedResponse = require("../../../Util/PaginatedResponse");
const { validateExamData, validateExamUpdate } = require("./helpers/examValidation");

// Create a new exam (which is also an event)
const createExam = async (examData) => {
  const validationErrors = validateExamData(examData);
  if (validationErrors.length > 0) {
    throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
  }

  return sequelize.transaction(async (t) => {
    // Validate course exists *if provided*
    if (examData.courseId) {
      const course = await course.findByPk(examData.courseId, { transaction: t });
      if (!course) {
        throw new Error("course_not_found");
      }
    }

    const eventData = {
      startDate: examData.date,
      endDate: examData.endDate || examData.date, // If no end date, use start date
      capacity: examData.capacity,
      numberOfRegistered: 0,
      status: examData.status || 'opend'
    };

    const event = await event.create(eventData, { transaction: t });

    // Create the exam linked to the event
    const exam = await exam.create({
      courseId: examData.courseId,
      supervisorId: examData.supervisorId,
      date: examData.date,
      place: examData.place,
      eventId: event.eventId
    }, { transaction: t });
    
    // Return only the exam ID
    return { examId: exam.examId };
  });
};

const getExamById = async (examId) => {
  const exam = await exam.findByPk(examId, {
    include: [
      { model: course, attributes: ['name'] },
      { model: User, as: 'supervisor', attributes: ['email'] },
      { model: event, attributes: ['eventId', 'startDate', 'endDate', 'capacity', 'numberOfRegistered', 'status'] }
    ]
  });

  if (!exam) {
    throw new Error("exam_not_found");
  }

  return exam;
};

const getAllExams = async (features) => {
  const {count, rows:exams} = await exam.findAndCountAll({
    ...features.options,
    include: [
      { model: course, attributes: ['name'] },
      { model: User, as: 'supervisor', attributes: ['userId', 'email'] },
      { model: event, attributes: ['eventId', 'startDate', 'endDate', 'capacity', 'numberOfRegistered', 'status'] }
    ]
  });

  if (!exams) {
    throw new Error("no_exams_found");
  }

  return PaginatedResponse.fromApiFeature(
    features,
    count,
    exams,
    "Exams fetched successfully"
  );
};

// Update exam by ID
const updateExam = async (examId, updateData) => {
  // Validate update data
  const validationErrors = validateExamUpdate(updateData);
  if (validationErrors.length > 0) {
    throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
  }

  return sequelize.transaction(async (t) => {
    const exam = await exam.findByPk(examId, { transaction: t });
    if (!exam) {
      throw new Error("exam_not_found");
    }

    // Validate course if being updated
    if (updateData.courseId) {
      const course = await course.findByPk(updateData.courseId, { transaction: t });
      if (!course) {
        throw new Error("course_not_found");
      }
    }

    // Update the exam
    await exam.update(updateData, { transaction: t });

    // If date is being updated, also update the linked event
    if (updateData.date) {
      const event = await event.findByPk(exam.eventId, { transaction: t });
      if (event) {
        await event.update({
          startDate: updateData.date,
          endDate: updateData.endDate || updateData.date
        }, { transaction: t });
      }
    }

    // Return updated exam with associations
    const updatedExam = await exam.findByPk(examId, {
      include: [
        { model: course, attributes: ['name'] },
        { model: User, as: 'supervisor', attributes: ['userId', 'email'] },
        { model: event, attributes: ['eventId', 'startDate', 'endDate', 'capacity', 'numberOfRegistered', 'status'] }
      ],
      transaction: t
    });

    return updatedExam;
  });
};

// Delete exam by ID (also deletes the linked event)
const deleteExam = async (examId) => {
  return sequelize.transaction(async (t) => {
    const exam = await exam.findByPk(examId, { transaction: t });
    if (!exam) {
      throw new Error("exam_not_found");
    }

    // Delete the exam first
    await exam.destroy({ where: { examId }, transaction: t });
    
    // Delete the linked event
    if (exam.eventId) {
      await event.destroy({ where: { eventId: exam.eventId }, transaction: t });
    }

    return { message: "Exam and linked event deleted successfully" };
  });
};

// Get upcoming exams (exams with date >= current date)
const getUpcomingExams = async (features) => {
  const where = { ...(features.options?.where || {}) };
  where.date = {
    [sequelize.Op.gte]: new Date()
  };

  const { count, rows: exams } = await exam.findAndCountAll({
    ...features.options,
    where,
    include: [
      { model: course, attributes: ['name'] },
      { model: User, as: 'supervisor', attributes: ['userId', 'email'] },
      { model: event, attributes: ['eventId', 'startDate', 'endDate', 'capacity', 'numberOfRegistered', 'status'] }
    ],
    order: [['date', 'ASC']]
  });

  if (!exams || exams.length === 0) {
    throw new Error("no_upcoming_exams_found");
  }

  return PaginatedResponse.fromApiFeature(
    features,
    count,
    exams,
    "Upcoming exams fetched successfully"
  );
};

// Get exam reservations (Students connected to exam through ExamReservation)
// todo
const getExamReservations = async (examId, features) => {
  const { count, rows: reservations } = await examReservation.findAndCountAll({
    ...features.options,
    where: { examId },
    include: [
      { model: Student, attributes: ['userId', 'email'] },///todo : n7ot elly 3ayzeno
      { model: exam, attributes: ['examId', 'date', 'place'] }
    ]
  });

  if (!reservations || reservations.length === 0) {
    throw new Error("no_reservations_found");
  }

  return PaginatedResponse.fromApiFeature(
    features,
    count,
    reservations,
    "Exam reservations fetched successfully"
  );
};

module.exports = {
  createExam,
  getExamById,
  getAllExams,
  updateExam,
  deleteExam,
  getUpcomingExams,
  getExamReservations
};
