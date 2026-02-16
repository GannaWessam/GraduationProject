const express = require("express");
const router = express.Router();
const CourseController = require("./CourseController");
const { validateToken } = require("../../middlewares/token");
const catchError = require("../../middlewares/catchError");
const checkPermission = require("../../middlewares/checkPermission");

router.get(
  "/getUserAllowCourses",
  validateToken,
  catchError(CourseController.getProductCoursesByIdController)
);
router.post(
  "/",
  validateToken,
  checkPermission("ADD_COURSE"),
  catchError(CourseController.addCourse)
);
router.get(
  "/",
  validateToken,
  checkPermission("VIEW_COURSE"),
  catchError(CourseController.getAllCoursesController)
);
router.get(
  "/:id",
  validateToken,
  checkPermission("VIEW_COURSE"),
  catchError(CourseController.getCourseById)
);
router.put(
  "/:id",
  validateToken,
  checkPermission("EDIT_COURSE"),
  catchError(CourseController.updateCourse)
);
router.delete(
  "/:id",
  validateToken,
  checkPermission("DELETE_COURSE"),
  catchError(CourseController.deleteCourse)
);
// router.post(
//   "/chooseCourses",
//   validateToken,
//   checkPermission("createCourses"),
//   catchError(CourseController.chooseCoursesController)
// );


module.exports = router;