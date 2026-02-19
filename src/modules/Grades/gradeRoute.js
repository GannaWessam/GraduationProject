const express = require("express");
const router = express.Router();
const controller = require("./gradeController");


router.get("/", controller.getAllReservations);

router.get("/:userId", controller.getReservationsByUserId);

module.exports = router;