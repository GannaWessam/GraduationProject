const express = require("express");
const router = express.Router();
const usersRoutes = require("./usersManagment/usersRouts");
const examRoutes = require("./examManagment/examRoutes");
const eventRoutes = require("./eventManagement/eventRoutes");
const trainingRoutes = require("./trainingManagement/trainingRoutes");
const packageRoutes = require("./packageManagement/packageRoutes");
const sessionRotes = require("./sessionManagement/sessionRoutes");
const currencyRoutes = require("./currencyManagement/currencyRoutes");

router.use("/usersManagment", usersRoutes);
router.use("/examManagment", examRoutes);
router.use("/eventManagement", eventRoutes);
router.use("/trainingManagement", trainingRoutes);
router.use("/packagegManagement", packageRoutes);
router.use("/sessionManagement", sessionRotes);
router.use("/currencyManagement", currencyRoutes);


module.exports = router;