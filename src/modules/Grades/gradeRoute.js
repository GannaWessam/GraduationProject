const express = require("express");
const router = express.Router();
const controller = require("./gradeController");


router.get("/event/:eventId", controller.getAllReservations);

router.get("/:userId", controller.getReservationsByUserId);

module.exports = router;