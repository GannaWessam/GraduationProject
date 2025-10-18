const { event, exam, training, course, User } = require("../../../models/index.js");
const ApiFeature = require("../../../Util/ApiFeatures");
const PaginatedResponse = require("../../../Util/PaginatedResponse");

// Get all events (both training and exam events) with filtering, searching, and pagination
const getAllEvents = async (features) => {
  try {
    // Build the base query with includes
    const queryOptions = {
      include: [
        {
          model: exam,
          as: 'exam',
          required: false, //lw ml'ahosh 3ady
          include: [
            { model: course, attributes: ['name'] },
            { model: User, as: 'supervisor', attributes: ['email'] }
          ]
        },
        {
          model: training,
          as: 'training',
          required: false,
          include: [
            { model: course, attributes: ['name'] },
            { model: User, as: 'trainer', attributes: ['email'] }
          ]
        }
      ],
      where: features.where,
      order: features.order,
      limit: features.limit,
      offset: features.offset,
      distinct: true
    };

    // Execute the query
    const { count, rows: events } = await event.findAndCountAll(queryOptions);

    return PaginatedResponse.fromApiFeature(
      features,
      count,
      reservations,
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
    const event = await event.findByPk(eventId);
    
    if (!event) {
      throw new Error("Event not found");
    }

    // Check the event type and call the appropriate method
    if (event.type === 'training') {
      // Find the training associated with this event
      const training = await training.findOne({ 
        where: { eventId: eventId },
        include: [
          { model: course, attributes: ['name'] },
          { model: User, as: 'trainer', attributes: ['email'] },
          { model: event, attributes: ['eventId', 'startDate', 'endDate', 'capacity', 'numberOfRegistered', 'status', 'type'] }
        ]
      });
      
      if (!training) {
        throw new Error("Training not found for this event");
      }
      
      return training;
    } else if (event.type === 'exam') {
      // Find the exam associated with this event
      const exam = await exam.findOne({ 
        where: { eventId: eventId },
        include: [
          { model: course, attributes: ['name'] },
          { model: User, as: 'supervisor', attributes: ['email'] },
          { model: event, attributes: ['eventId', 'startDate', 'endDate', 'capacity', 'numberOfRegistered', 'status', 'type'] }
        ]
      });
      
      if (!exam) {
        throw new Error("Exam not found for this event");
      }
      return exam;
    } else {
      throw new Error("Invalid event type");
    }
  } catch (error) {
    throw new Error("Failed to fetch event");
  }
};


module.exports = {
  getAllEvents,
  getEventById,
};
