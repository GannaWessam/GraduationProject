const express = require("express");
const router = express.Router();
const examController = require("./examController");
const catchError = require("../../../middlewares/catchError");
const { validateToken } = require("../../../middlewares/token");



router.post("/", validateToken, catchError(examController.createExam));
router.get("/", validateToken, catchError(examController.getAllExams));
router.get("/upcoming", validateToken, catchError(examController.getUpcomingExams));
router.get("/:id", validateToken, catchError(examController.getExamById));

// Get exam reservations (students connected to exam)
router.get("/:id/reservations", validateToken, catchError(examController.getExamReservations));
router.put("/:id", validateToken, catchError(examController.updateExam));
router.delete("/:id",validateToken, catchError(examController.deleteExam));

module.exports = router;
