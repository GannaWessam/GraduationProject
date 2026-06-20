const reservationService = require("./reservationService");
const eventService = require("./eventService");
const ApiResponse = require("../../../Util/ApiResponse");
const { Student } = require("../../../models");

const registerForExam = async (req, res, next) => {
  try {
    const userId = req.userData.id;
    const { eventId } = req.body;
    const result = await reservationService.registerForExam(userId, eventId, req);
    res.status(200).json(ApiResponse.success(result));
  } catch (error) {
    return next(error);
  }
};

const registerForTraining = async (req, res, next) => {
  try {
    const userId =req.userData.id;
    const {  eventId } = req.body;
    const result = await reservationService.registerForTraining(userId, eventId, req);
    res.status(200).json(ApiResponse.success(result, "User registered for training"));
  } catch (error) {
    return next(error);
  }
};

const getAvailableEventsForUserController = async (req, res, next) => {
  try {
    const userId =req.query.userId?? req.userData.id;
    const StudentData = await Student.findOne({where:{userId:userId}});
    const { userId: _, ...queryWithoutUserId } = req.query;
    const result = await eventService.getAvailableEventsForUserService(userId,StudentData.productId, queryWithoutUserId);
    res.status(200).json(ApiResponse.success(result, "Success"));
  } catch (error) {
    return next(error);
  }
};

const getUserActiveReservationsController = async (req, res, next) => {
  try {
const userId = req.query.userId;
    const reservations = await reservationService.getUserActiveReservations(userId);
    res.status(200).json(ApiResponse.success(reservations, "Active reservations fetched successfully"));
  } catch (error) {
    return next(error);
  }
};



module.exports = {
  registerForExam,
  registerForTraining,
  getAvailableEventsForUserController,
  getUserActiveReservationsController
};
