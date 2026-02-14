const { event, exam, training, course, User, reservation , trainer , supervisor ,sequelize} = require("../../../models/index.js");
const ApiFeature = require("../../../Util/ApiFeatures");
const PaginatedResponse = require("../../../Util/PaginatedResponse");
const { Op } = require("sequelize");
const { handleCreateGroupChatForEvent } = require("../../user/reserveEvents/helpers/helper");


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
      as: 'exams',
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

    // Convert the event instance to plain object
    const eventObj = eventt.get({ plain: true });

    if (eventObj.type === 'training') {
      // Find the training associated with this event
      const trainingg = await training.findAll({
        where: { eventId: eventId },
        include: [
          { model: course, attributes: ['name'] },
          { model: trainer, as: 'trainer', attributes: ['Name'] },
          { model: event, as: 'event', attributes: ['eventId','eventName', 'startDate', 'endDate', 'capacity', 'numberOfRegistered', 'status', 'type'] }
        ]
      });

      eventObj.trainings = trainingg.map(t => t.get({ plain: true }));
      return eventObj;

    } else if (eventObj.type === 'exam') {
      // Find the exams associated with this event
      const examm = await exam.findAll({
        where: { eventId: eventId },
        include: [
          { model: course, attributes: ['name'] },
          { model: supervisor, as: 'supervisor', attributes: ['Name'] },
          { model: event, as: 'event', attributes: ['eventId','eventName', 'startDate', 'endDate', 'capacity', 'numberOfRegistered', 'status', 'type'] }
        ]
      });

      // Convert exam instances to plain objects
      eventObj.exams = examm.map(e => e.get({ plain: true }));

      return eventObj;

    } else {
      throw new Error("Invalid event type");
    }
  } catch (error) {
    console.error(error);
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
    if (updatedEvent) {
      await handleCreateGroupChatForEvent(
        eventInstance.eventId,
        eventInstance.eventName,
        eventInstance.type
      );
      return "event closed successfully";
    }
      
      
    throw new Error("Failed to close event");
};


const updateEvent = async (eventId, updateData) => {
  return sequelize.transaction(async (t) => {

    const eventt = await event.findByPk(eventId, { transaction: t });
    if (!eventt) throw new Error("event_not_found");

    const allowedFields = [
      "eventName",
      "startDate",
      "endDate",
      "startDateRes",
      "endDateRes",
      "capacity",
      "status",
      "language"
    ];

    for (const key of allowedFields) {
      if (updateData[key] !== undefined) {
        eventt[key] = updateData[key];
      }
    }

    await eventt.save({ transaction: t });

    return eventt;
  });
};

module.exports = {
  getAllEvents,
  getEventById,
  closeEventById,
  updateEvent
};
