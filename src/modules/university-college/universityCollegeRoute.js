const express = require("express");
const router = express.Router();
const UniversityCollegeController = require("./universityCollegeController");
const catchError = require("../../middlewares/catchError");
const { validateToken } = require("../../middlewares/token");
const checkPermission = require("../../middlewares/checkPermission");

router.post(
  "/",
  validateToken,
  // checkPermission("createUniversityCollege"),
  catchError(UniversityCollegeController.addUniversityCollege)
);
router.get(
  "/",
  validateToken,
  // checkPermission("getUniversityColleges"),
  catchError(UniversityCollegeController.getAllUniversityCollegesController)
);
router.get(
  "/:id",
  validateToken,
  // checkPermission("getUniversityCollege"),
  catchError(UniversityCollegeController.getUniversityCollegeById)
);
router.put(
  "/:id",
  validateToken,
  // checkPermission("updateUniversityCollege"),
  catchError(UniversityCollegeController.updateUniversityCollege)
);
router.delete(
  "/:id",
  validateToken,
  // checkPermission("deleteUniversityCollege"),
  catchError(UniversityCollegeController.deleteUniversityCollege)
);
router.get(
  "/university/:universityId/colleges",
  validateToken,
  // checkPermission("getUniversityColleges"),
  catchError(UniversityCollegeController.getCollegesByUniversity)
);

module.exports = router;