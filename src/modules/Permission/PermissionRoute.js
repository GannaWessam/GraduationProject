const express = require("express");
const router = express.Router();
const PermissionController = require("./PermissionController");
const catchError = require("../../middlewares/catchError");
const checkPermission = require("../../middlewares/checkPermission");
const { validateToken } = require("../../middlewares/token");

// router.use(validateToken);

router.post(
  "/",
  validateToken,
  // checkPermission("CREATE_PERMISSION"),
  catchError(PermissionController.addPermission)
);

router.get(
  "/",
  validateToken,
  // checkPermission("getPermissions"),
  catchError(PermissionController.getAllPermissionsController)
);

router.get(
  "/:id",
  validateToken,
  // checkPermission("getPermission"),
  catchError(PermissionController.getPermissionById)
);

router.put(
  "/:id",
  validateToken,
  // checkPermission("updatePermission"),
  catchError(PermissionController.updatePermission)
);

router.delete(
  "/:id",
  validateToken,
  // checkPermission("deletePermission"),
  catchError(PermissionController.deletePermission)
);
router.post(
  "/seed",
  validateToken,
  // checkPermission("createPermission"),
  catchError(PermissionController.seedPermissionsController)
);


module.exports = router;
