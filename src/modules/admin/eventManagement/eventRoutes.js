const express = require("express");
const router = express.Router();
const eventController = require("./eventController");
const catchError = require("../../../middlewares/catchError");

// Get all events (both training and exam events) with filtering, searching, and pagination
router.get("/", catchError(eventController.getAllEvents));
router.get("/:id", catchError(eventController.getEventById));

module.exports = router;
