const { session: Session, training: Training,trainingReservation, sequelize,event,SessionMaterial } = require("../../../../models/index");
const { Op } = require("sequelize");

async function validateSession(sessionData, ignoreSessionId = null) {
    const trainingObj = await Training.findByPk(sessionData.trainingId, {
      include: [{ model: event, as: "event" }]
    });
  
    if (!trainingObj) {
      throw new Error("Training not found");
    }
  
    const eventObj = trainingObj.event;
  
    // ✅ Date validation
    const sessionDate = new Date(sessionData.date);
  
    if (sessionDate < new Date(eventObj.startDate)) {
      throw new Error(
        `Session date cannot be before event start date (${eventObj.startDate.toISOString().split('T')[0]})`
      );
    }
  
    if (sessionDate > new Date(eventObj.endDate)) {
      throw new Error(
        `Session date cannot be after event end date (${eventObj.endDate.toISOString().split('T')[0]})`
      );
    }
  
    // ✅ Time validation
    function parseTimeToMinutes(time) {
      const parts = time.split(":");
  
      if (parts.length < 2 || parts.length > 3) {
        throw new Error("Invalid time format, expected HH:mm or HH:mm:ss");
      }
  
      const hours = Number(parts[0]);
      const minutes = Number(parts[1]);
      const seconds = parts[2] ? Number(parts[2]) : 0;
  
      if (
        isNaN(hours) || isNaN(minutes) || isNaN(seconds) ||
        hours < 0 || hours > 23 ||
        minutes < 0 || minutes > 59 ||
        seconds < 0 || seconds > 59
      ) {
        throw new Error("Invalid time format, expected HH:mm or HH:mm:ss");
      }
  
      return hours * 60 + minutes + seconds / 60;
    }
  
    const startMinutes = parseTimeToMinutes(sessionData.startTime);
    const endMinutes   = parseTimeToMinutes(sessionData.endTime);
  
    if (startMinutes >= endMinutes) {
      throw new Error("Session start time must be before end time");
    }
  
    // ✅ Get all trainings in same event
    const trainingsInEvent = await Training.findAll({
      where: { eventId: trainingObj.eventId },
      attributes: ["trainingId"]
    });
  
    const trainingIdsInEvent = trainingsInEvent.map(t => t.trainingId);
  
    // ✅ Overlap check (exclude current session if updating)
    const whereCondition = {
      date: sessionData.date,
      trainingId: { [Op.in]: trainingIdsInEvent },
      [Op.and]: [
        { startTime: { [Op.lt]: sessionData.endTime } },
        { endTime: { [Op.gt]: sessionData.startTime } }
      ]
    };
  
    if (ignoreSessionId) {
      whereCondition.sessionId = { [Op.ne]: ignoreSessionId };
    }
  
    const conflict = await Session.findOne({ where: whereCondition });
  
    if (conflict) {
      throw new Error(
        "Session time overlaps with another session in the same training or event"
      );
    }
  }
  
  module.exports = {
    validateSession
  };