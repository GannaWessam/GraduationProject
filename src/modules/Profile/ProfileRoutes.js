const express = require("express");
const router = express.Router();
const ProfileController = require("./ProfileController");
const catchError = require("../../middlewares/catchError");
const checkPermission = require("../../middlewares/checkPermission");
const { validateToken } = require("../../middlewares/token");

// Create profile
router.post(
  "/",
  validateToken,
//   checkPermission("CREATE_PROFILE"),
  catchError(ProfileController.addProfile)
);

// Get all profiles
router.get(
  "/",
  validateToken,
//   checkPermission("VIEW_PROFILE"),
  catchError(ProfileController.getAllProfilesController)
);

// Get single profile
router.get(
  "/:id",
    validateToken,

//   checkPermission("VIEW_PROFILE"),
  catchError(ProfileController.getProfileById)
);

// Update profile
router.put(
  "/:id",
    validateToken,

//   checkPermission("UPDATE_PROFILE"),
  catchError(ProfileController.updateProfile)
);

// Delete profile
router.delete(
  "/:id",
    validateToken,

//   checkPermission("DELETE_PROFILE"),
  catchError(ProfileController.deleteProfile)
);

module.exports = router;
