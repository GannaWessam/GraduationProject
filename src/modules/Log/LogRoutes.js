const express = require("express");
const router = express.Router();
const LogController = require("./LogController");
const catchError = require("../../middlewares/catchError");
const { validateToken } = require("../../middlewares/token");
const checkPermission = require("../../middlewares/checkPermission");

router.get(
  "/",
  validateToken,
//   checkPermission("VIEW_LOGS"),
  catchError(LogController.getAllLogs)
);

router.get(
  "/:id",
  validateToken,
//   checkPermission("VIEW_LOGS"),
  catchError(LogController.getLogById)
);

module.exports = router;