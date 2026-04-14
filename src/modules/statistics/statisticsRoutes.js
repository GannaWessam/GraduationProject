const express = require("express");
const router = express.Router();
const statisticsController = require("./statisticsController");
const catchError = require("../../middlewares/catchError");
const { validateToken } = require("../../middlewares/token");
const checkPermission = require("../../middlewares/checkPermission");

router.get(
    "/stats",
    catchError(statisticsController.getStudentsStats)
);

router.get(
    "/stats/courses-exams",
    catchError(statisticsController.getCoursesAndExamsStats)
  );


module.exports = router;
