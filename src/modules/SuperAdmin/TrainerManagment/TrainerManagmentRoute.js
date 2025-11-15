const express = require("express");
const router = express.Router();
const TrainerController = require("./TrainerManagmentController");
const catchError = require("../../../middlewares/catchError");

router.post("/add-Trainer",TrainerController.register);



module.exports = router;
