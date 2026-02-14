const express = require("express");
const router = express.Router();
const trainingController = require("./trainingController");
const catchError = require("../../../middlewares/catchError");
const { validateToken } = require("../../../middlewares/token");
const checkPermission = require("../../../middlewares/checkPermission");

router.post(
  "/",
  validateToken,
  checkPermission("ADD_EVENT"),
  catchError(trainingController.createTraining)
);

// Get all trainings with filtering, searching, and pagination
router.get(
  "/",
  validateToken,
  checkPermission("VIEW_EVENT"),
  catchError(trainingController.getAllTrainings)
);
router.get(
  "/:id",
  validateToken,
  checkPermission("VIEW_EVENT"),
  catchError(trainingController.getTrainingById)
);

// Get training reservations (students connected to training)
router.get(
  "/:id/reservations",
  validateToken,
  // checkPermission("getTraining"),
  catchError(trainingController.getTrainingReservations)
);
router.put(
  "/:id",
  validateToken,
  checkPermission("UPDATE_EVENT"),
  catchError(trainingController.updateTraining)
);

// router.delete(
//   "/:id",
//   validateToken,
//   checkPermission("deleteTraining"),
//   catchError(trainingController.deleteTraining)
// );

module.exports = router;
