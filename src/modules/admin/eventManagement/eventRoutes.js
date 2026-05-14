const express = require("express");
const router = express.Router();
const eventController = require("./eventController");
const catchError = require("../../../middlewares/catchError");
const { validateToken } = require("../../../middlewares/token");
const checkPermission = require("../../../middlewares/checkPermission");

// Get all events (both training and exam events) with filtering, searching, and pagination
router.get(
  "/",
  validateToken,
  checkPermission("VIEW_EVENT"),
  catchError(eventController.getAllEvents),
);
router.get(
  "/:id",
  validateToken,
  checkPermission("VIEW_EVENT"),
  catchError(eventController.getEventById),
);
router.put(
  "/close/:eventId",
  validateToken,
  checkPermission("CLOSE_EVENT"),
  catchError(eventController.closeEventById),
);
router.put(
  "/:id",
  validateToken,
  checkPermission("EDIT_EVENT"),
  catchError(eventController.updateEvent),
);
router.delete(
  "/:id",
  validateToken,
  // checkPermission("DELETE_EVENT"),
  catchError(eventController.deleteEventById),
);

router.delete("/deleteEvent/:eventId",validateToken,checkPermission("DELETE_EVENT"),catchError(eventController.deleteEventController));

module.exports = router;
