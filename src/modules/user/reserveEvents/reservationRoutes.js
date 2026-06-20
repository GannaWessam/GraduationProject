const express = require("express");
const router = express.Router();
const reservationController = require("./reservationController");
const { validateToken } = require("../../../middlewares/token");

router.post("/register-exam",validateToken ,reservationController.registerForExam);
router.post("/register-training",validateToken ,reservationController.registerForTraining);
router.get("/events",validateToken, reservationController.getAvailableEventsForUserController);
router.get("/active-reservations",validateToken , reservationController.getUserActiveReservationsController);
router.post("/superAdmin/register-exam/:userId",validateToken ,reservationController.registerForExamBySuperAdminController);
router.post("/superAdmin/register-training/:userId",validateToken ,reservationController.registerForTrainBySuperAdminController);

module.exports = router;
