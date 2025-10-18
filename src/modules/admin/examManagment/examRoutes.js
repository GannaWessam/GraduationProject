const express = require("express");
const router = express.Router();
const examController = require("./examController");
const catchError = require("../../../middlewares/catchError");

// Apply catchError middleware to all routes
router.use(catchError);

router.post("/", examController.createExam);
router.get("/", examController.getAllExams);
router.get("/upcoming", examController.getUpcomingExams);
router.get("/:id", examController.getExamById);

// Get exam reservations (students connected to exam)
router.get("/:id/reservations", examController.getExamReservations);
router.get("/course/:courseId", examController.getExamsByCourseId); //dol zyada 7alyan
router.get("/supervisor/:supervisorId", examController.getExamsBySupervisorId);//dol zyada 7alyan
router.put("/:id", examController.updateExam);
router.delete("/:id", examController.deleteExam);

module.exports = router;
