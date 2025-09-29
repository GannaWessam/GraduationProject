const express = require("express");
const router = express.Router();
const UniversityController = require("./universityController");
const catchError = require("../../middlewares/catchError");

router.post("/", catchError(UniversityController.addUniversity));
router.get("/", catchError(UniversityController.getAllUniversitiesController));
router.get("/:id", catchError(UniversityController.getUniversityById));
router.put("/:id", catchError(UniversityController.updateUniversity));
router.delete("/:id", catchError(UniversityController.deleteUniversity));

module.exports = router;