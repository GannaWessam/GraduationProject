const express = require("express");
const router = express.Router();
const trainingController = require("./trainingController");
const catchError = require("../../../middlewares/catchError");
const { validateToken } = require("../../../middlewares/token");

router.post("/", validateToken, catchError(trainingController.createTraining));

// Get all trainings with filtering, searching, and pagination
router.get("/",validateToken, catchError(trainingController.getAllTrainings));
router.get("/:id", validateToken, catchError(trainingController.getTrainingById));

// Get training reservations (students connected to training)
router.get("/:id/reservations", validateToken, catchError(trainingController.getTrainingReservations));
router.put("/:id", validateToken, catchError(trainingController.updateTraining));
router.delete("/:id", validateToken, catchError(trainingController.deleteTraining));

module.exports = router;
