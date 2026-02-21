const express = require("express");
const router = express.Router();
const UniversityController = require("./universityController");
const catchError = require("../../middlewares/catchError");
const { validateToken } = require("../../middlewares/token");
const checkPermission = require("../../middlewares/checkPermission");

router.post(
  "/",
  catchError(UniversityController.addUniversity)
);
router.get(
  "/",
  catchError(UniversityController.getAllUniversitiesController)
);
router.get(
  "/:id",
  catchError(UniversityController.getUniversityById)
);
router.put(
  "/:id",
  catchError(UniversityController.updateUniversity)
);
router.delete(
  "/:id",
  catchError(UniversityController.deleteUniversity)
);

module.exports = router;