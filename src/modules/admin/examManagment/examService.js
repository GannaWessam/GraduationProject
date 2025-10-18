const { Exam, Course, User, Event, ExamReservation, sequelize } = require("../../../models");
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
      const course = await Course.findByPk(examData.courseId, { transaction: t });
      if (!course) {
        throw new Error("course_not_found");
      }
    }

    const eventData = {
      startDate: examData.date,
      endDate: examData.endDate || examData.date, // If no end date, use start date
      capacity: examData.capacity,
      numberOfRegistered: 0,
      status: examData.status || 'scheduled'
    };

    const event = await Event.create(eventData, { transaction: t });

    // Create the exam linked to the event
    const exam = await Exam.create({
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
  const exam = await Exam.findByPk(examId, {
    include: [
      { model: Course, attributes: ['courseName'] },
      { model: User, as: 'supervisor', attributes: ['email'] },
      { model: Event, attributes: ['eventId', 'startDate', 'endDate', 'capacity', 'numberOfRegistered', 'status'] }
    ]
  });

  if (!exam) {
    throw new Error("exam_not_found");
  }

  return exam;
};

const getAllExams = async (features) => {
  const { count, rows: exams } = await Exam.findAndCountAll({
    ...features.options,
    include: [
      { model: Course, attributes: ['courseName'] },
      { model: User, as: 'supervisor', attributes: ['userId', 'email'] },
      { model: Event, attributes: ['eventId', 'startDate', 'endDate', 'capacity', 'numberOfRegistered', 'status'] }
    ]
  });

  if (!exams || exams.length === 0) {
    throw new Error("no_exams_found");
  }

  return PaginatedResponse.fromApiFeature(
    features,
    count,
    exams,
    "Exams fetched successfully"
  );
};

// Get exams by course ID
const getExamsByCourseId = async (courseId, features) => {
  const where = { ...(features.options?.where || {}) };
  where.courseId = courseId;

  const { count, rows: exams } = await Exam.findAndCountAll({
    ...features.options,
    where,
    include: [
      { model: Course, attributes: ['courseId', 'courseName'] },
      { model: User, as: 'supervisor', attributes: ['userId', 'email'] },
      { model: Event, attributes: ['eventId', 'startDate', 'endDate', 'capacity', 'numberOfRegistered', 'status'] }
    ]
  });

  if (!exams || exams.length === 0) {
    throw new Error("no_exams_found_for_course");
  }

  return PaginatedResponse.fromApiFeature(
    features,
    count,
    exams,
    "Course exams fetched successfully"
  );
};

// Get exams by supervisor ID
const getExamsBySupervisorId = async (supervisorId, features) => {
  const where = { ...(features.options?.where || {}) };
  where.supervisorId = supervisorId;

  const { count, rows: exams } = await Exam.findAndCountAll({
    ...features.options,
    where,
    include: [
      { model: Course, attributes: ['courseId', 'courseName'] },
      { model: User, as: 'supervisor', attributes: ['userId', 'email'] },
      { model: Event, attributes: ['eventId', 'startDate', 'endDate', 'capacity', 'numberOfRegistered', 'status'] }
    ]
  });

  if (!exams || exams.length === 0) {
    throw new Error("no_exams_found_for_supervisor");
  }

  return PaginatedResponse.fromApiFeature(
    features,
    count,
    exams,
    "Supervisor exams fetched successfully"
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
    const exam = await Exam.findByPk(examId, { transaction: t });
    if (!exam) {
      throw new Error("exam_not_found");
    }

    // Validate course if being updated
    if (updateData.courseId) {
      const course = await Course.findByPk(updateData.courseId, { transaction: t });
      if (!course) {
        throw new Error("course_not_found");
      }
    }

    // Update the exam
    await exam.update(updateData, { transaction: t });

    // If date is being updated, also update the linked event
    if (updateData.date) {
      const event = await Event.findByPk(exam.eventId, { transaction: t });
      if (event) {
        await event.update({
          startDate: updateData.date,
          endDate: updateData.endDate || updateData.date
        }, { transaction: t });
      }
    }

    // Return updated exam with associations
    const updatedExam = await Exam.findByPk(examId, {
      include: [
        { model: Course, attributes: ['courseId', 'courseName'] },
        { model: User, as: 'supervisor', attributes: ['userId', 'email'] },
        { model: Event, attributes: ['eventId', 'startDate', 'endDate', 'capacity', 'numberOfRegistered', 'status'] }
      ],
      transaction: t
    });

    return updatedExam;
  });
};

// Delete exam by ID (also deletes the linked event)
const deleteExam = async (examId) => {
  return sequelize.transaction(async (t) => {
    const exam = await Exam.findByPk(examId, { transaction: t });
    if (!exam) {
      throw new Error("exam_not_found");
    }

    // Delete the exam first
    await Exam.destroy({ where: { examId }, transaction: t });
    
    // Delete the linked event
    if (exam.eventId) {
      await Event.destroy({ where: { eventId: exam.eventId }, transaction: t });
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

  const { count, rows: exams } = await Exam.findAndCountAll({
    ...features.options,
    where,
    include: [
      { model: Course, attributes: ['courseId', 'courseName'] },
      { model: User, as: 'supervisor', attributes: ['userId', 'email'] },
      { model: Event, attributes: ['eventId', 'startDate', 'endDate', 'capacity', 'numberOfRegistered', 'status'] }
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
  const { count, rows: reservations } = await ExamReservation.findAndCountAll({
    ...features.options,
    where: { examId },
    include: [
      { model: Student, attributes: ['userId', 'email'] },///todo : n7ot elly 3ayzeno
      { model: Exam, attributes: ['examId', 'date', 'place'] }
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
  getExamsByCourseId,
  getExamsBySupervisorId,
  updateExam,
  deleteExam,
  getUpcomingExams,
  getExamReservations
};
