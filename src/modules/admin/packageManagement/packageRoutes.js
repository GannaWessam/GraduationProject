const express = require("express");
const router = express.Router();
const packageController = require("./packageController");
const catchError = require("../../../middlewares/catchError");
const { validateToken } = require("../../../middlewares/token");
const checkPermission = require("../../../middlewares/checkPermission");

router.post(
  "/",
  validateToken,
  checkPermission("ADD_PACKAGE"),
  catchError(packageController.create)
);
router.get(
  "/",
  validateToken,
  checkPermission("VIEW_PACKAGE"),
  catchError(packageController.getAll)
);
router.get(
  "/:id",
  validateToken,
  checkPermission("VIEW_PACKAGE"),
  catchError(packageController.getById)
);
router.put(
  "/:id",
  validateToken,
  checkPermission("EDIT_PACKAGE"),
  catchError(packageController.update)
);
router.delete(
  "/:id",
  validateToken,
  checkPermission("DELETE_PACKAGE"),
  catchError(packageController.delete)
);

module.exports = router;
