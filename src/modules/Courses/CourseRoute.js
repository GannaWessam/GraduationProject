const express = require("express");
const router = express.Router();
const CourseController = require("./CourseController");
const catchError = require("../../middlewares/catchError");
const { validateToken } = require("../../middlewares/token");


router.get("/getUserAllowCourses",validateToken, catchError(CourseController.getProductCoursesByIdController));
router.post("/chooseCourses",validateToken, catchError(CourseController.chooseCoursesController));


module.exports = router;