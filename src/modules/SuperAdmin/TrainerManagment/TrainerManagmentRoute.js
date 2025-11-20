const express = require("express");
const router = express.Router();
const TrainerController = require("./TrainerManagmentController");
const catchError = require("../../../middlewares/catchError");


router.get("/",catchError(TrainerController.getAll));
router.get("/:id",catchError(TrainerController.getById));
router.post("/add-Trainer",catchError(TrainerController.register));





module.exports = router;
