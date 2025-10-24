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
    const result = await eventService.getAvailableEventsForUserService(userId,StudentData.productId);
    res.status(200).json(ApiResponse.success(result, "User registered for exam"));
  } catch (error) {
    next(error); // Pass to global error handler
  }
};


module.exports = {
  registerForExam,
  registerForTraining,
  getAvailableEventsForUserController,
};
