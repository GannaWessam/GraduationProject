const express = require("express");
const router = express.Router();
const CollegeController = require("./collegeController");
const catchError = require("../../middlewares/catchError");
const { validateToken } = require("../../middlewares/token");
const checkPermission = require("../../middlewares/checkPermission");

router.post(
  "/",
  validateToken,
  // checkPermission("createCollege"),
  catchError(CollegeController.addCollege)
);
router.get(
  "/",
  validateToken,
  // checkPermission("getColleges"),
  catchError(CollegeController.getAllCollegesController)
);
router.get(
  "/:id",
  validateToken,
  // checkPermission("getCollege"),
  catchError(CollegeController.getCollegeById)
);
router.put(
  "/:id",
  validateToken,
  // checkPermission("updateCollege"),
  catchError(CollegeController.updateCollege)
);
router.delete(
  "/:id",
  validateToken,
  // checkPermission("deleteCollege"),
  catchError(CollegeController.deleteCollege)
);

module.exports = router;