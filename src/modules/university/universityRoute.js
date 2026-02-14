const express = require("express");
const router = express.Router();
const UniversityController = require("./universityController");
const catchError = require("../../middlewares/catchError");
const { validateToken } = require("../../middlewares/token");
const checkPermission = require("../../middlewares/checkPermission");

router.post(
  "/",
  validateToken,
  // checkPermission("createUniversity"),
  catchError(UniversityController.addUniversity)
);
router.get(
  "/",
  validateToken,
  // checkPermission("getUniversities"),
  catchError(UniversityController.getAllUniversitiesController)
);
router.get(
  "/:id",
  validateToken,
  // checkPermission("getUniversity"),
  catchError(UniversityController.getUniversityById)
);
router.put(
  "/:id",
  validateToken,
  // checkPermission("updateUniversity"),
  catchError(UniversityController.updateUniversity)
);
router.delete(
  "/:id",
  validateToken,
  // checkPermission("deleteUniversity"),
  catchError(UniversityController.deleteUniversity)
);

module.exports = router;