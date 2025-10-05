const ApiResponse = require("../Util/ApiResponse");
const { errorMessages } = require("../modules/common/errorMessages");

function errorHandler(err, req, res, next) {
  console.error("Error caught:", err);

  if (err.message && errorMessages[err.message]) {
    const { code, msg } = errorMessages[err.message];
    return res.status(code).json(ApiResponse.error(code, msg, [msg]));///???
  }

  return res
    .status(500)
    .json(ApiResponse.error(500, "Internal Server Error", [err.message || "unknown_error"]));
}

module.exports = errorHandler;
