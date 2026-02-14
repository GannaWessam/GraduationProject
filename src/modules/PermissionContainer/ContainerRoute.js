const express = require("express");
const router = express.Router();
const ContainerController = require("./ContainerController");
const catchError = require("../../middlewares/catchError");
const { validateToken } = require("../../middlewares/token");
const checkPermission = require("../../middlewares/checkPermission");

// CRUD routes
router.post(
  "/",
  validateToken,
  // checkPermission("createPermissionContainer"),
  catchError(ContainerController.addContainer)
);
router.get(
  "/",
  validateToken,
  // checkPermission("getPermissionContainers"),
  catchError(ContainerController.getAllContainersController)
);
router.get(
  "/:id",
  validateToken,
  // checkPermission("getPermissionContainer"),
  catchError(ContainerController.getContainerById)
);
router.put(
  "/:id",
  validateToken,
  // checkPermission("updatePermissionContainer"),
  catchError(ContainerController.updateContainer)
);
router.delete(
  "/:id",
  validateToken,
  // checkPermission("deletePermissionContainer"),
  catchError(ContainerController.deleteContainer)
);

module.exports = router;
