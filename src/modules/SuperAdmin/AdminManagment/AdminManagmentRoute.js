const express = require("express");
const router = express.Router();
const AdminController = require("./AdminManagmentController");
const catchError = require("../../../middlewares/catchError");
const { validateToken } = require("../../../middlewares/token");
const checkPermission = require("../../../middlewares/checkPermission");

router.get(
  "/",
  catchError(AdminController.getAll),
);
router.get(
  "/:id",
  validateToken,

  catchError(AdminController.getById),
);
router.post(
  "/add-Admin",
  validateToken,
  checkPermission("ADD_ADMIN"),
  catchError(AdminController.register),
);
router.put(
  "/:id",
  validateToken,
  checkPermission("EDIT_ADMIN"),
  AdminController.update,
);
router.delete(
  "/:id",
  validateToken,
  checkPermission("DELETE_ADMIN"),
  AdminController.remove,
);

module.exports = router;
