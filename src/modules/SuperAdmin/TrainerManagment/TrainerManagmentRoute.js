const express = require("express");
const router = express.Router();
const TrainerController = require("./TrainerManagmentController");
const catchError = require("../../../middlewares/catchError");
const { validateToken } = require("../../../middlewares/token");
const checkPermission = require("../../../middlewares/checkPermission");

router.get("/",validateToken,catchError(TrainerController.getAll));
router.get("/:id",validateToken,catchError(TrainerController.getById));
router.post("/add-Trainer",validateToken,checkPermission("ADD_TRAINER"),catchError(TrainerController.register));
router.put("/:id", validateToken,catchError(TrainerController.update));
router.delete("/:id",validateToken,checkPermission("DELETE_TRAINER"), catchError(TrainerController.remove));





module.exports = router;
