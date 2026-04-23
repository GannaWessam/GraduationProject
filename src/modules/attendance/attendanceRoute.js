const express = require("express");
const router = express.Router();
const attendanceController = require("./attendanceController");
const catchError = require("../../middlewares/catchError");
const checkPermission = require("../../middlewares/checkPermission");
const { validateToken } = require("../../middlewares/token");



router.post(
  "/:sessionId",
  validateToken,
  // checkPermission("createAttendance"),
  catchError(attendanceController.create)
);


router.get(
  "/",
  validateToken,
  // checkPermission("getAttendances"),
  catchError(attendanceController.getAll)
);


router.get(
  "/:id",
  validateToken,
  // checkPermission("getAttendance"),
  catchError(attendanceController.getById)
);


router.get(
  "/Session-Attendance/:sessionId",
  validateToken,
  catchError(attendanceController.getBySession)
);


router.get(
  "/Attendance/user",
  validateToken,
  // checkPermission("getAttendances"),
  catchError(attendanceController.getByUser)
);

router.delete(
  "/:id",
  validateToken,
  // checkPermission("deleteAttendance"),
  catchError(attendanceController.delete)
);

module.exports = router;
