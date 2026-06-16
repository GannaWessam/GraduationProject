const express = require("express");
const router = express.Router();
const PermissionController = require("./PermissionController");
const catchError = require("../../middlewares/catchError");
const { validateToken } = require("../../middlewares/token");

// router.use(validateToken);

router.post(
  "/",
  validateToken,
  catchError(PermissionController.addPermission)
);

router.get(
  "/",
  validateToken,
  catchError(PermissionController.getAllPermissionsController)
);

router.get(
  "/:id",
  validateToken,
  catchError(PermissionController.getPermissionById)
);

router.put(
  "/:id",
  validateToken,
  catchError(PermissionController.updatePermission)
);

router.delete(
  "/:id",
  validateToken,
  catchError(PermissionController.deletePermission)
);
router.post(
  "/seed",
  // validateToken,
  catchError(PermissionController.seedPermissionsController)
);


module.exports = router;
