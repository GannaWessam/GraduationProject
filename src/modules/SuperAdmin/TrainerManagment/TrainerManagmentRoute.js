const express = require("express");
const router = express.Router();
const TrainerController = require("./TrainerManagmentController");
const catchError = require("../../../middlewares/catchError");
const { validateToken } = require("../../../middlewares/token");
const checkPermission = require("../../../middlewares/checkPermission");

router.get("/",validateToken,checkPermission("VIEW_TRAINER"),catchError(TrainerController.getAll));
router.get("/:id",validateToken,checkPermission("VIEW_TRAINER"),catchError(TrainerController.getById));
router.post("/add-Trainer",validateToken,checkPermission("ADD_TRAINER"),catchError(TrainerController.register));
router.put("/:id", validateToken,checkPermission("EDIT_TRAINER"),catchError(TrainerController.update));
router.delete("/:id",validateToken,checkPermission("DELETE_TRAINER"), catchError(TrainerController.remove));





module.exports = router;
