const express = require("express");
const router = express.Router();
const controller = require("./gradeController");
const { validateToken } = require("../../middlewares/token");
const checkPermission = require("../../middlewares/checkPermission");


router.get("/event/:eventId",validateToken,checkPermission("VIEW_RESULTS"), controller.getAllReservations);

router.get("/:userId", controller.getReservationsByUserId);

module.exports = router;