const reservationService = require("./reservationService");
const ApiResponse = require("../../../Util/ApiResponse");

const registerForExam = async (req, res) => {
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
    const userId = req.userData.id;
    const { eventId } = req.body;

    if (!eventId) {
      return res.status(400).json(ApiResponse.error("eventId is required"));
    }

    const result = await reservationService.registerForTraining(
      userId,
      eventId
    );
    res.status(200).json(ApiResponse.success(result));
  } catch (error) {
    console.error("Error in registerForTrainingController:", error);
    res.status(500).json(ApiResponse.error(error.message));
  }
};
module.exports = {
  registerForExam,
  registerForTraining,
};
