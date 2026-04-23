const statisticsService = require("./statisticsService");
const ApiResponse = require("../../Util/ApiResponse");

async function getStudentsStats(req, res, next) {
  try {
    const result = await statisticsService.getStudentsStats();
    return res.status(200).json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
}

async function getCoursesAndExamsStats(req, res, next) {
    try {
      const result = await statisticsService.getCoursesAndExamsStats();
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  }


async function getTrainerTrainingsCountController(req, res ,next) {
    try {
      const { trainerId } = req.params;
  
      if (!trainerId) {
        return res.status(400).json({
          success: false,
          message: "trainerId is required"
        });
      }
  
      const data = await statisticsService.getTrainerTrainings(trainerId);
  
      return res.status(200).json(ApiResponse.success(data));
  
    } catch (error) {
      next(error);
    }
  }

async function getTrainerStudentsCountController(req, res ,next) {
    try {
      const { trainerId } = req.params;
  
      if (!trainerId) {
        return res.status(400).json({
          success: false,
          message: "trainerId is required"
        });
      }
  
      const data = await statisticsService.getTrainerStudentsCount(trainerId);
  
      return res.status(200).json(ApiResponse.success(data));
  
    } catch (error) {
      next(error);
    }
  }

  async function getSupervisorExamStatsController(req, res ,next) {
    try {
      const { supervisorId } = req.params;
  
      if (!supervisorId) {
        return res.status(400).json({
          success: false,
          message: "supervisorId is required"
        });
      }
  
      const data = await statisticsService.getSupervisorExamStats(supervisorId);
  
      return res.status(200).json(ApiResponse.success(data));
  
    } catch (error) {
      next(error);
    }
  }
  
  

module.exports = {
  getStudentsStats,
  getCoursesAndExamsStats,
  getTrainerTrainingsCountController,
  getTrainerStudentsCountController,
  getSupervisorExamStatsController
};