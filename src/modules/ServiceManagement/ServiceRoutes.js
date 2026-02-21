const express = require("express");
const router = express.Router();
const ServiceController = require("./ServiceController");
const catchError = require("../../middlewares/catchError");
const { validateToken } = require("../../middlewares/token");
const checkPermission = require("../../middlewares/checkPermission");

router.post(
  "/",
  validateToken,
//   checkPermission("ADD_SERVICE"),
  catchError(ServiceController.addService),
);

router.get("/", validateToken, catchError(ServiceController.getAllServices));

router.get("/:id", validateToken, catchError(ServiceController.getServiceById));

router.put(
  "/:id",
  validateToken,
//   checkPermission("EDIT_SERVICE"),
  catchError(ServiceController.updateService),
);

router.delete(
  "/:id",
  validateToken,
//   checkPermission("DELETE_SERVICE"),
  catchError(ServiceController.deleteService),
);

module.exports = router;
