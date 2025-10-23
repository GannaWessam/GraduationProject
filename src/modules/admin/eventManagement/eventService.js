const { event, exam, training, course, User } = require("../../../models/index.js");
const ApiFeature = require("../../../Util/ApiFeatures");
const PaginatedResponse = require("../../../Util/PaginatedResponse");
const { Op } = require("sequelize");


const getAllEvents = async (features) => {
  try {
    
    const opts = { ...(features.options || {}) };

    // base where is whatever ApiFeature produced for event fields (e.g. type, status, date, etc.)
    const baseWhere = opts.where || {};

    // handle courseId specially because courseId lives on exam/training, not on event
    const courseIdFilter = baseWhere.courseId;
    if (courseIdFilter) {
      // remove it from top-level where so it doesn't try to match event.courseId
      delete baseWhere.courseId;
    }

    // Build includes for exam and training with nested course/user includes
    const examInclude = {
      model: exam,
      as: 'exam',
      required: false,
      include: [
        { model: course, attributes: ['name'] },
        { model: User, as: 'supervisor', attributes: ['email'] }
      ]
    };

    const trainingInclude = {
      model: training,
      as: 'training',
      required: false,
      include: [
        { model: course, attributes: ['name'] },
        { model: User, as: 'trainer', attributes: ['email'] }
      ]
    };

    if (courseIdFilter) {
      baseWhere[Op.or] = [
        { ['$exam.courseId$']: courseIdFilter },
        { ['$training.courseId$']: courseIdFilter }
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
      "all events fetched successfully"
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
          { model: User, as: 'trainer', attributes: ['email'] },
          { model: event, attributes: ['eventId', 'startDate', 'endDate', 'capacity', 'numberOfRegistered', 'status', 'type'] }
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
          { model: User, as: 'supervisor', attributes: ['email'] },
          { model: event, attributes: ['eventId', 'startDate', 'endDate', 'capacity', 'numberOfRegistered', 'status', 'type'] }
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
    if(updatedEvent)
      return "event closed successfully"
    throw new Error("Failed to close event");
};

module.exports = {
  getAllEvents,
  
  getEventById,
  closeEventById,
};
