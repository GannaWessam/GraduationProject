const express = require("express");
const router = express.Router();
const trainingController = require("./trainingController");
const catchError = require("../../../middlewares/catchError");

router.post("/", catchError(trainingController.createTraining));

// Get all trainings with filtering, searching, and pagination
router.get("/", catchError(trainingController.getAllTrainings));
router.get("/:id", catchError(trainingController.getTrainingById));

// Get training reservations (students connected to training)
router.get("/:id/reservations", catchError(trainingController.getTrainingReservations));
router.put("/:id", catchError(trainingController.updateTraining));
router.delete("/:id", catchError(trainingController.deleteTraining));

module.exports = router;
