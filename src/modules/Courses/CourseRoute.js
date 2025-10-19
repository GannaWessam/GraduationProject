const express = require("express");
const router = express.Router();
const CourseController = require("./CourseController");
const { validateToken } = require("../../middlewares/token");
const catchError = require("../../middlewares/catchError");

router.post("/", catchError(CourseController.addCourse));
router.get("/", catchError(CourseController.getAllCoursesController));
router.get("/:id", catchError(CourseController.getCourseById));
router.put("/:id", catchError(CourseController.updateCourse));
router.delete("/:id", catchError(CourseController.deleteCourse));

router.get("/getUserAllowCourses",validateToken, catchError(CourseController.getProductCoursesByIdController));
router.post("/chooseCourses",validateToken, catchError(CourseController.chooseCoursesController));


module.exports = router;