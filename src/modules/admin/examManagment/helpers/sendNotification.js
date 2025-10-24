const { studentCourse, training, exam, event, sequelize } = require('../../../../models/index'); // adjust path

async function getEligibleUserIdsForEvent(eventId) {

  const evt = await event.findByPk(eventId);
  if (!evt) throw new Error("event_not_found");

  const courseId = evt.type === "exam"
    ? (await exam.findOne({ where: { eventId }, attributes: ['courseId'] }))?.courseId
    : (await training.findOne({ where: { eventId }, attributes: ['courseId'] }))?.courseId;

  if (!courseId) throw new Error("course_not_found_for_event");

  if (evt.type === "training") {
   
    const students = await studentCourse.findAll({
      where: {
        courseId,
        trainingStatus: { [sequelize.Op.eq]: "pending" },
      },
      attributes: ["userId"],
    });
    return students.map(s => s.userId);
  } else if (evt.type === "exam") {
    // For exam, get students registered for the course who completed the related training
    const trainings = await training.findAll({ where: { courseId }, attributes: ['eventId'] });
    const trainingEventIds = trainings.map(t => t.eventId);

    // Get users who completed at least one training event for this course
    const students = await studentCourse.findAll({
      where: {
        courseId,
        trainingStatus: { [sequelize.Op.ne]: "pending" }, // assuming "completed" is the flag
      },
      attributes: ["userId"],
    });
    return students.map(s => s.userId);
  } else {
    return [];
  }
}

module.exports = {
    getEligibleUserIdsForEvent
}
