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
  res
    .status(200)
    .json(ApiResponse.success(result, "Events retrieved successfully"));
};

// Get event by ID
const getEventById = async (req, res) => {
  const { id } = req.params;
  const result = await eventService.getEventById(id);
  res
    .status(200)
    .json(ApiResponse.success(result, "Event retrieved successfully"));
};

const closeEventById = async (req, res) => {
  const { eventId } = req.params;
  const result = await eventService.closeEventById(eventId,req);
  res.status(200).json(ApiResponse.success(result));
};

const updateEvent = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const result = await eventService.updateEvent(id, updateData,req);
  res
    .status(200)
    .json(
      ApiResponse.success(result, "Exam and linked event updated successfully"),
    );
};

const deleteEventById = async (req, res) => {
  const { id } = req.params;

  const result = await eventService.deleteEventById(id,req);

  res
    .status(200)
    .json(ApiResponse.success(result, "Event deleted successfully"));
};

const deleteEventController = async (req, res) => {
  try {
    const { eventId } = req.params;

    const result = await eventService.deleteEventService(eventId,req);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
const changeEventStatus = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const result = await eventService.changeEventStatusService(eventId);

    res.status(200).json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
};

const exportEventReservations = async (req, res) => {
  const { eventId } = req.params;

  const workbook = await eventService.exportEventReservations(
    eventId
  );

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  res.setHeader(
    "Content-Disposition",
    `attachment; filename="event-${eventId}-reservations.xlsx"`
  );

  await workbook.xlsx.write(res);

  res.end();
};

module.exports = {
  getAllEvents,
  getEventById,
  closeEventById,
  updateEvent,
  deleteEventById,
  deleteEventController,
  changeEventStatus,
  exportEventReservations
};
