const LogService = require("./LogService");
const ApiResponse = require("../../Util/ApiResponse");

async function getAllLogs(req, res, next) {
  try {
    const reqIp =
      req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    const reqUser = req.userData;

    const result = await LogService.getAllLogsService(
      req.query || {},
      reqUser,
      reqIp
    );

    return res.status(200).json(ApiResponse.success(result));
  } catch (error) {
    return next(error);
  }
}

async function getLogById(req, res, next) {
  try {
    const reqIp =
      req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    const reqUser = req.userData;

    const result = await LogService.getLogById(
      req.params.id,
      reqUser,
      reqIp
    );

    return res.status(200).json(ApiResponse.success(result));
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getAllLogs,
  getLogById,
};