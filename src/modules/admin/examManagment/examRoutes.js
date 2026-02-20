const express = require("express");
const router = express.Router();
const examController = require("./examController");
const catchError = require("../../../middlewares/catchError");
const { validateToken } = require("../../../middlewares/token");
const checkPermission = require("../../../middlewares/checkPermission");



router.post(
  "/",
  validateToken,
  checkPermission("ADD_EVENT"),
  catchError(examController.createExam)
);
router.get(
  "/",
  validateToken,
  checkPermission(["VIEW_EVENT","VIEW_ASSGINED_EXAMS"]),
  catchError(examController.getAllExams)
);
// router.get(
//   "/upcoming",
//   validateToken,
//   checkPermission("getExams"),
//   catchError(examController.getUpcomingExams)
// );
router.get(
  "/:id",
  validateToken,
  checkPermission("VIEW_EVENT"),
  catchError(examController.getExamById)
);

// Get exam reservations (students connected to exam)
router.get(
  "/:id/reservations",
  validateToken,
  // checkPermission("getExam"),
  catchError(examController.getExamReservations)
);
router.put(
  "/:id",
  validateToken,
  checkPermission("EDIT_EVENT"),
  catchError(examController.updateExam)
);
// router.delete(
//   "/:id",
//   validateToken,
//   checkPermission("deleteExam"),
//   catchError(examController.deleteExam)
// );

module.exports = router;
