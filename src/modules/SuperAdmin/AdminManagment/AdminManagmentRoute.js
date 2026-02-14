const express = require("express");
const router = express.Router();
const AdminController = require("./AdminManagmentController");
const catchError = require("../../../middlewares/catchError");
const { validateToken } = require("../../../middlewares/token");
const checkPermission = require("../../../middlewares/checkPermission");

router.get(
  "/",
  validateToken,
  checkPermission("VIEW_ADMIN"),
  catchError(AdminController.getAll),
);
router.get(
  "/:id",
  validateToken,
  checkPermission("VIEW_ADMIN"),

  catchError(AdminController.getById),
);
router.post(
  "/add-Admin",
  validateToken,
  checkPermission("VIEW_ADMIN"),
  catchError(AdminController.register),
);
router.put(
  "/:id",
  validateToken,
  checkPermission("VIEW_ADMIN"),
  AdminController.update,
);
router.delete(
  "/:id",
  validateToken,
  checkPermission("VIEW_ADMIN"),
  AdminController.remove,
);

module.exports = router;
