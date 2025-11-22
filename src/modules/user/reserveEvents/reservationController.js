const reservationService = require("./reservationService");
const eventService = require("./eventService");
const ApiResponse = require("../../../Util/ApiResponse");
const { Student } = require("../../../models");

const registerForExam = async (req, res, next) => {
  try {
    const userId = req.userData.id;
    const { eventId } = req.body;
    const result = await reservationService.registerForExam(userId, eventId);
    res.status(200).json(ApiResponse.success(result));
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json(ApiResponse.error(error.message));
  }
};

const registerForTraining = async (req, res, next) => {
  try {
    const userId =req.userData.id;
    const {  eventId } = req.body;
    const result = await reservationService.registerForTraining(userId, eventId);
    res.status(200).json(ApiResponse.success(result, "User registered for training"));
  } catch (error) {
    console.error("Error in registerForTrainingController:", error);
    res.status(500).json(ApiResponse.error(error.message));
  }
};

const getAvailableEventsForUserController = async (req, res, next) => {
  try {
    const userId = req.userData.id;
    const StudentData = await Student.findOne({where:{userId:userId}});
    console.log(StudentData);
    
    const result = await eventService.getAvailableEventsForUserService(userId,StudentData.productId,req.query);
    res.status(200).json(ApiResponse.success(result, "Success"));
  } catch (error) {
    next(error); // Pass to global error handler
  }
};

const getUserActiveReservationsController = async (req, res, next) => {
  try {
const userId = req.query.userId;
    const reservations = await reservationService.getUserActiveReservations(userId);
    res.status(200).json(ApiResponse.success(reservations, "Active reservations fetched successfully"));
  } catch (err) {
    next(err);
  }
};



module.exports = {
  registerForExam,
  registerForTraining,
  getAvailableEventsForUserController,
  getUserActiveReservationsController
};
