const eventService = require("./eventService");
const ApiFeature = require("../../../Util/ApiFeatures");
const ApiResponse = require("../../../Util/ApiResponse");

// Get all events (both training and exam events) with filtering, searching, and pagination
const getAllEvents = async (req, res) => {
    const features = new ApiFeature(req.query)
      .filter()
      .search()
      .sort()
      .pagination()
      .selectedFields();
    
    const result = await eventService.getAllEvents(features);
    res.status(200).json(ApiResponse.success(result, "Events retrieved successfully"));
};

// Get event by ID
const getEventById = async (req, res) => {
    const { id } = req.params;
    const result = await eventService.getEventById(id);
    res.status(200).json(ApiResponse.success(result, "Event retrieved successfully"));
};

const closeEventById = async (req, res) => {
  const { eventId } = req.params;
  const result = await eventService.closeEventById(eventId);
  res.status(200).json(ApiResponse.success(result));
};



module.exports = {
  getAllEvents,
  getEventById,
  closeEventById,
};
