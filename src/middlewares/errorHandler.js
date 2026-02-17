const ApiResponse = require("../Util/ApiResponse");
const { getErrorPayload } = require("../modules/common/errorMessages");

/**
 * Centralized error handler. Ensures req.audit.message is set for every error
 * so the audit log records the same bilingual message as the response.
 * Uses errorMessages.js as single source of truth; unknown errors use internal_server_error.
 */
function errorHandler(err, req, res, next) {
  console.error("Error caught:", err);

  const errorKey = err && err.message ? String(err.message).trim() : "internal_server_error";
  const { code, msg } = getErrorPayload(errorKey);

  if (req && req.audit) {
    req.audit.message = msg;
  }

  return res.status(code).json(ApiResponse.error(code, msg, [msg]));
}

module.exports = errorHandler;
