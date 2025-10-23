const reservationService = require("./reservationService");
const ApiResponse = require("../../../Util/ApiResponse");


const registerForExam = async (req, res, next) => {
  try {
    const { userId, examId } = req.body;
    const result = await reservationService.registerForExam(userId, examId);
    res.status(200).json(ApiResponse.success(result, "User registered for exam"));
  } catch (error) {
    next(error); // Pass to global error handler
  }
};

const registerForTraining = async (req, res, next) => {
  try {
    const { userId, trainingId } = req.body;
    const result = await reservationService.registerForTraining(userId, trainingId);
    res.status(200).json(ApiResponse.success(result, "User registered for training"));
  } catch (error) {
    next(error); // Pass to global error handler
  }
};
module.exports = {
  registerForExam,
  registerForTraining,
};
