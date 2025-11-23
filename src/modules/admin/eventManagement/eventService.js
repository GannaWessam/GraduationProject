const { event, exam, training, course, User, reservation , trainer , supervisor } = require("../../../models/index.js");
const ApiFeature = require("../../../Util/ApiFeatures");
const PaginatedResponse = require("../../../Util/PaginatedResponse");
const { Op } = require("sequelize");
const chattingService = require("../../../Services/chattingService");


const getAllEvents = async (features) => {
  try {
    const opts = { ...(features.options || {}) };
    const baseWhere = opts.where || {};

    // handle courseId specially
    const courseIdFilter = baseWhere.courseId;
    if (courseIdFilter) delete baseWhere.courseId;

    // handle trainerId specially
    const trainerIdFilter = baseWhere.trainerId;
    if (trainerIdFilter) delete baseWhere.trainerId;

    const examInclude = {
      model: exam,
      as: 'exam',
      required: false,
      include: [
        { model: course, attributes: ['name'] },
        { model: supervisor, as: 'supervisor', attributes: ['Name'] }
      ]
    };

    const trainingInclude = {
      model: training,
      as: 'trainings',
      required: trainerIdFilter ? true : false, // include only if filtering
      where: trainerIdFilter ? { trainerId: trainerIdFilter } : undefined,
      include: [
        { model: course, attributes: ['name'] },
        { model: trainer, as: 'trainer', attributes: ['Name'] }
      ]
    };

    // OR condition for courseId only
    if (courseIdFilter) {
      baseWhere[Op.or] = [
        { ['$exam.courseId$']: courseIdFilter },
        { ['$trainings.courseId$']: courseIdFilter }
      ];
    }

    const queryOptions = {
      include: [examInclude, trainingInclude],
      where: baseWhere,
      order: opts.order || [['createdAt', 'DESC']],
      limit: opts.limit,
      offset: opts.offset,
      attributes: opts.attributes,
      distinct: true
    };

    const { count, rows: events } = await event.findAndCountAll(queryOptions);

    return PaginatedResponse.fromApiFeature(
      features,
      count,
      events,
      "All events fetched successfully"
    );
  } catch (error) {
    throw new Error(`Failed to fetch events: ${error.message}`);
  }
};


// Get event by ID (both training and exam events)
const getEventById = async (eventId) => {
  try {
    // First get the event to check its type
    const eventt = await event.findByPk(eventId);
    
    if (!eventt) {
      throw new Error("Event not found");
    }

    // Check the event type and call the appropriate method
    if (eventt.type === 'training') {
      // Find the training associated with this event
      const trainingg = await training.findOne({ 
        where: { eventId: eventId },
        include: [
          { model: course, attributes: ['name'] },
          { model: trainer, as: 'trainer', attributes: ['Name'] },
          { model: event ,as: 'event', attributes: ['eventId','eventName', 'startDate', 'endDate', 'capacity', 'numberOfRegistered', 'status', 'type'] }
        ]
      });
      
      if (!trainingg) {
        throw new Error("Training not found for this event");
      }
      
      return trainingg;
    } else if (eventt.type === 'exam') {
      // Find the exam associated with this event
      const examm = await exam.findOne({ 
        where: { eventId: eventId },
        include: [
          { model: course, attributes: ['name'] },
          { model: supervisor, as: 'supervisor', attributes: ['Name'] },
          { model: event, as: 'event', attributes: ['eventId','eventName', 'startDate', 'endDate', 'capacity', 'numberOfRegistered', 'status', 'type'] }
        ]
      });
      
      if (!examm) {
        throw new Error("Exam not found for this event");
      }
      return examm;
    } else {
      throw new Error("Invalid event type");
    }
  } catch (error) {
    throw new Error("Failed to fetch event");
  }
};

const closeEventById = async (eventId) => {
    const eventInstance  = await event.findByPk(eventId);
    if (!eventInstance ) {
      throw new Error("Event not found");
    }
    eventInstance.status = "closed";
    const updatedEvent = await eventInstance.save(); //=> offline update
    if(updatedEvent){
      if(eventInstance.type === "training"){
        const allReservations = await reservation.findAll({ where: { eventId: eventInstance.eventId } });
        const userIds = allReservations.map((reservation) => reservation.userId);
        await chattingService.createGroupConversation(userIds,eventInstance.eventId, eventInstance.eventName);
      }
      return "event closed successfully";
    }
      
      
    throw new Error("Failed to close event");
};

module.exports = {
  getAllEvents,
  getEventById,
  closeEventById,
};
