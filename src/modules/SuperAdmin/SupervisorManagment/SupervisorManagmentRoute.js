const express = require("express");
const router = express.Router();
const SupervisorController = require("./SupervisorManagmentController");
const catchError = require("../../../middlewares/catchError");


router.get("/",catchError(SupervisorController.getAll));
router.get("/:id",catchError(SupervisorController.getById));
router.post("/add-Supervisor",catchError(SupervisorController.register));




module.exports = router;