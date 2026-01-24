const express = require("express");
const router = express.Router();
const ContainerController = require("./ContainerController");
const catchError = require("../../middlewares/catchError");

// CRUD routes
router.post("/", catchError(ContainerController.addContainer));
router.get("/", catchError(ContainerController.getAllContainersController));
router.get("/:id", catchError(ContainerController.getContainerById));
router.put("/:id", catchError(ContainerController.updateContainer));
router.delete("/:id", catchError(ContainerController.deleteContainer));

module.exports = router;
