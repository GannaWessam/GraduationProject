const express = require("express");
const router = express.Router();
const UniversityCollegeController = require("./universityCollegeController");
const catchError = require("../../middlewares/catchError");

router.post("/", catchError(UniversityCollegeController.addUniversityCollege));
router.get("/", catchError(UniversityCollegeController.getAllUniversityCollegesController));
router.get("/:id", catchError(UniversityCollegeController.getUniversityCollegeById));
router.put("/:id", catchError(UniversityCollegeController.updateUniversityCollege));
router.delete("/:id", catchError(UniversityCollegeController.deleteUniversityCollege));
router.get("/university/:universityId/colleges", catchError(UniversityCollegeController.getCollegesByUniversity));

module.exports = router;