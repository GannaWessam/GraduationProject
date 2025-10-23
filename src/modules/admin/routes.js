const express = require("express");
const router = express.Router();
const usersRoutes = require("./usersManagment/usersRouts");
const examRoutes = require("./examManagment/examRoutes");
const eventRoutes = require("./eventManagement/eventRoutes");
const trainingRoutes = require("./trainingManagement/trainingRoutes");

router.use("/usersManagment", usersRoutes);
router.use("/examManagment", examRoutes);
router.use("/eventManagement", eventRoutes);
router.use("/trainingManagement", trainingRoutes);

module.exports = router;