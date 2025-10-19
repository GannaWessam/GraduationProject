const express = require("express");
const router = express.Router();
const eventController = require("./eventController");
const catchError = require("../../../middlewares/catchError");
const { validateToken } = require("../../../middlewares/token");

// Get all events (both training and exam events) with filtering, searching, and pagination
router.get("/", validateToken, catchError(eventController.getAllEvents));
router.get("/:id", validateToken, catchError(eventController.getEventById));
router.put("/close/:eventId",validateToken,
    catchError(eventController.closeEventById)
  );

module.exports = router;
