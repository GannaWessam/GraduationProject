const { Event, Exam, Training, Course, User } = require("../../../models");
const ApiFeature = require("../../../Util/ApiFeatures");
const PaginatedResponse = require("../../../Util/PaginatedResponse");

// Get all events (both training and exam events) with filtering, searching, and pagination
const getAllEvents = async (features) => {
  try {
    // Build the base query with includes
    const queryOptions = {
      include: [
        {
          model: Exam,
          as: 'exam',
          required: false, //lw ml'ahosh 3ady
          include: [
            { model: Course, attributes: ['courseName'] },
            { model: User, as: 'supervisor', attributes: ['email'] }
          ]
        },
        {
          model: Training,
          as: 'training',
          required: false,
          include: [
            { model: Course, attributes: ['courseName'] },
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
    const { count, rows: events } = await Event.findAndCountAll(queryOptions);

    // Create paginated response
    const paginatedResponse = new PaginatedResponse(
      events,
      features.page,
      features.limit,
      count
    );

    return paginatedResponse;
  } catch (error) {
    throw new Error(`Failed to fetch events: ${error.message}`);
  }
};

// Get event by ID (both training and exam events)
// const getEventById = async (eventId) => {
  
// };


module.exports = {
  getAllEvents,
  getEventById,
};
