const express = require("express");
const router = express.Router();
const TrainerController = require("./TrainerManagmentController");
const catchError = require("../../../middlewares/catchError");

router.post("/add-Trainer",catchError(TrainerController.register));
router.get("/",catchError(TrainerController.getAll));
router.get("/:id",catchError(TrainerController.getById));



module.exports = router;
