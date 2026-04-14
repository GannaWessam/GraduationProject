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

module.exports = {
  getStudentsStats,
  getCoursesAndExamsStats
};