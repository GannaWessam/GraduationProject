const express = require("express");
const router = express.Router();
const SupervisorController = require("./SupervisorManagmentController");
const catchError = require("../../../middlewares/catchError");

const { validateToken } = require("../../../middlewares/token");
const checkPermission = require("../../../middlewares/checkPermission");
router.get("/",validateToken,catchError(SupervisorController.getAll));
router.get("/:id",validateToken,catchError(SupervisorController.getById));
router.post("/add-Supervisor",validateToken,checkPermission("ADD_SUPERVISOR"),catchError(SupervisorController.register));
router.put("/:id", validateToken,catchError(SupervisorController.update));
router.delete("/:id", validateToken,checkPermission("DELETE_SUPERVISOR"),catchError(SupervisorController.remove));



module.exports = router;