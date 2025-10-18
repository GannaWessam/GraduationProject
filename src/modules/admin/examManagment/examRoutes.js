const express = require("express");
const router = express.Router();
const examController = require("./examController");
const catchError = require("../../../middlewares/catchError");


router.post("/", catchError(examController.createExam));
router.get("/", catchError(examController.getAllExams));
router.get("/upcoming", catchError(examController.getUpcomingExams));
router.get("/:id", catchError(examController.getExamById));

// Get exam reservations (students connected to exam)
router.get("/:id/reservations", catchError(examController.getExamReservations));
router.put("/:id", catchError(examController.updateExam));
router.delete("/:id", catchError(examController.deleteExam));

module.exports = router;
