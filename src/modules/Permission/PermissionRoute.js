const express = require("express");
const router = express.Router();
const PermissionController = require("./PermissionController");
const catchError = require("../../middlewares/catchError");
// const { validateToken } = require("../../middlewares/auth");
const checkPermission = require("../../middlewares/checkPermission");

// router.use(validateToken);

router.post(
  "/",
  checkPermission("CREATE_PERMISSION"),
  catchError(PermissionController.addPermission)
);

router.get(
  "/",
  // checkPermission("VIEW_PERMISSION"),
  catchError(PermissionController.getAllPermissionsController)
);

router.get(
  "/:id",
  // checkPermission("VIEW_PERMISSION"),
  catchError(PermissionController.getPermissionById)
);

router.put(
  "/:id",
  // checkPermission("UPDATE_PERMISSION"),
  catchError(PermissionController.updatePermission)
);

router.delete(
  "/:id",
  // checkPermission("DELETE_PERMISSION"),
  catchError(PermissionController.deletePermission)
);
router.post(
  "/seed",
//   checkPermission("CREATE_PERMISSION"),
  catchError(PermissionController.seedPermissionsController)
);


module.exports = router;
