const express = require("express");
const router = express.Router();
const CollegeController = require("./collegeController");
const catchError = require("../../middlewares/catchError");

router.post("/", catchError(CollegeController.addCollege));
router.get("/", catchError(CollegeController.getAllCollegesController));
router.get("/:id", catchError(CollegeController.getCollegeById));
router.put("/:id", catchError(CollegeController.updateCollege));
router.delete("/:id", catchError(CollegeController.deleteCollege));

module.exports = router;