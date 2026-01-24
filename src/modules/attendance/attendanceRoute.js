const express = require("express");
const router = express.Router();
const attendanceController = require("./attendanceController");
const catchError = require("../../middlewares/catchError");
const { validateToken } = require("../../middlewares/token");



router.post(
  "/:sessionId",
  validateToken,
  catchError(attendanceController.create)
);


router.get(
  "/",
  validateToken,
  catchError(attendanceController.getAll)
);


router.get(
  "/:id",
  validateToken,
  catchError(attendanceController.getById)
);


router.get(
  "/Session-Attendance/:sessionId",
  validateToken,
  catchError(attendanceController.getBySession)
);


router.get(
  "/User-Attendance/:userId",
  validateToken,
  catchError(attendanceController.getByUser)
);

router.delete(
  "/:id",
  validateToken,
  catchError(attendanceController.delete)
);

module.exports = router;
