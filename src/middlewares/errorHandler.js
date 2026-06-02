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
  const isLoginRoute =req.originalUrl.includes("/login")

  if (req && req.audit && !isLoginRoute) {
    req.audit.message = msg;
    // req.audit.user= req.userData ? { _id: req.userData.id, name: req.userData.name, email: req.userData.email } : null;
  }

  const response = ApiResponse.error(code, msg, [msg]);
  if (err && err.nationalId !== undefined) {
    response.details = { nationalId: err.nationalId };
  }
  return res.status(code).json(response);
}

module.exports = errorHandler;
