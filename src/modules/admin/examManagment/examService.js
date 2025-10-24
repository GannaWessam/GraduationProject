const { request } = require("express");
const { exam, course, User, event, examReservation, sequelize, Student} = require("../../../models/index.js");
const { sendNotificationToUsers } = require("../../../Services/pushService.js");
const ApiFeature = require("../../../Util/ApiFeatures");
const PaginatedResponse = require("../../../Util/PaginatedResponse");
const { validateExamData, validateUpdateEvent } = require("./helpers/examValidation");
const { getEligibleUserIdsForEvent } = require("./helpers/sendNotification.js");
const ws = require('../../../Services/WebSocket');
const packageService = require("../../admin/packageManagement/packageService.js");

// Create a new exam (which is also an event)

const createExam = async (examData) => {
  if(examData.packageId)
    await createExamPackage(examData)
  else if(examData.courseId)
    await createOneExam(examData,true)
  else throw new Error("packageId or courseId is required");
}

const createExamPackage = async (examData) => {
  const pkg = await packageService.getPackageById(examData.packageId)
  if(!pkg)
    throw new Error("package_not_found")
  let createNewEventDespiteTheSameData = true;
  for (let i = 0; i < pkg.courses.length; i++) {
    examData.courseId = pkg.courses[i].courseId;     
    await createOneExam(examData, createNewEventDespiteTheSameData);
    createNewEventDespiteTheSameData = false;
  }
}

const createOneExam = async (examData, createNewEventDespiteTheSameData) => {
  const validationErrors = validateExamData(examData);
  if (validationErrors.length > 0) {
    throw new Error(`Validation failed: ${validationErrors.join(", ")}`);
  }
  
  const {eventt, examm}= await sequelize.transaction(async (t) => {
    // Validate course exists *if provided*
    if (examData.courseId) {
      const coursee = await course.findByPk(examData.courseId, {
        transaction: t,
      });
      if (!coursee) {
        throw new Error("course_not_found");
      }
    }

    const eventData = {
      startDate: examData.startDate,
      endDate: examData.endDate || examData.startDate, 
      capacity: examData.capacity,
      numberOfRegistered: 0,
      eventName: examData.eventName,
      packageId: examData.packageId, // موجود فعلاً عندك
      productId: examData.productId || null, // لازم يكون موجود في جدول product
      startDateRes: examData.startDateRes,
      endDateRes: examData.endDateRes,
      status: examData.status || "opend",
      type:"exam"
    };

    let eventt;
    if(createNewEventDespiteTheSameData){ 
      eventt = await event.findOne({
        where :  {
        eventName: examData.eventName,
        type: "exam",
      }, transaction: t})
      if(eventt)
        throw new Error("there is alraedy exam with the same name")
      eventt = await event.create(eventData, { transaction: t })
    }else{
      eventt = await event.findOne({where : eventData, transaction: t})
    }
    // console.log("Event Created",eventt);
    if(!eventt)
      throw new Error("///////////////////////////////")
    console.log("\n\n\n\n\n");
    console.log(eventt);
    console.log("\n\n\n\n\n");

    

    // Create the exam linked to the event
     const examm = await exam.create(
      {
        courseId: examData.courseId,
        supervisorId: examData.supervisorId,
        date: examData.date,
        place: examData.place,
        eventId: eventt.dataValues.eventId,
      },
      { transaction: t }
    );
    // Return only the exam ID
    return { eventt, examm};
  });
  // const userIds = await getEligibleUserIdsForEvent(eventt.dataValues.eventId);
  // if (userIds.length === 0) return { message: "No eligible users found" };

  // const results = await sendNotificationToUsers(userIds, payload);
  await ws.notifyClients("new event has been opend", "newEvent");

  return { examId: examm.examId };

};

const getExamById = async (examId) => {
  const examm = await exam.findByPk(examId, {
    include: [
      { model: course, attributes: ['name'] },
      { model: User, as: 'supervisor', attributes: ['email'] },
      { model: event, attributes: ['eventId', 'startDate', 'endDate', 'capacity', 'numberOfRegistered', 'status'] }
    ]
  });

  if (!examm) {
    throw new Error("exam_not_found");
  }

  return examm;
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
  
  return sequelize.transaction(async (t) => {
    const examm = await exam.findByPk(examId, { transaction: t });
    if (!examm) {
      throw new Error("exam_not_found");
    }

    // Validate course if being updated
    if (updateData.courseId) {
      const coursee = await course.findByPk(updateData.courseId, { transaction: t });
      if (!coursee) {
        throw new Error("course_not_found");
      }
    }

     if (updateData.supervisorId) {
      const supervisor = await User.findByPk(updateData.supervisorId, { transaction: t });
      if (!supervisor) {
        throw new Error("trainer_not_found");
      }
    }

    

    // Update the exam
    await examm.update(updateData, { transaction: t }); //لو فيه columns مش حابة تتغير → ماتضيفيهاش في updateData.

    const eventData = validateUpdateEvent(updateData);
    if (eventData) {
      const eventt = await event.findByPk(examm.eventId, { transaction: t });
      if (eventt) {
        await eventt.update(eventData, { transaction: t });
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
