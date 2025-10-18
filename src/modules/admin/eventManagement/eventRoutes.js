const express = require("express");
const router = express.Router();
const eventController = require("./eventController");
const catchError = require("../../../middlewares/catchError");


router.use(catchError);

// Get all events (both training and exam events) with filtering, searching, and pagination
router.get("/", eventController.getAllEvents);
router.get("/:id", eventController.getEventById);

module.exports = router;
