const express = require("express");
const router = express.Router();
const statisticsController = require("./statisticsController");
const catchError = require("../../middlewares/catchError");
const { validateToken } = require("../../middlewares/token");
const checkPermission = require("../../middlewares/checkPermission");

router.get(
    "/stats",
    validateToken,
    catchError(statisticsController.getStudentsStats)
);

router.get(
    "/stats/courses-exams",
    validateToken,
    catchError(statisticsController.getCoursesAndExamsStats)
  );

router.get(
    "/stats/trainer-training/:trainerId",
    validateToken,
    catchError(statisticsController.getTrainerTrainingsCountController)
  );

router.get(
    "/stats/trainer-student/:trainerId",
    validateToken,
    catchError(statisticsController.getTrainerStudentsCountController)
  );

router.get(
    "/stats/supervisor/:supervisorId",
    validateToken,
    catchError(statisticsController.getSupervisorExamStatsController)
  );



module.exports = router;
