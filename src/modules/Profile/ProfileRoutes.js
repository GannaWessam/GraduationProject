const express = require("express");
const router = express.Router();
const ProfileController = require("./ProfileController");
const catchError = require("../../middlewares/catchError");
const checkPermission = require("../../middlewares/checkPermission");

// Create profile
router.post(
  "/",
//   checkPermission("CREATE_PROFILE"),
  catchError(ProfileController.addProfile)
);

// Get all profiles
router.get(
  "/",
//   checkPermission("VIEW_PROFILE"),
  catchError(ProfileController.getAllProfilesController)
);

// Get single profile
router.get(
  "/:id",
//   checkPermission("VIEW_PROFILE"),
  catchError(ProfileController.getProfileById)
);

// Update profile
router.put(
  "/:id",
//   checkPermission("UPDATE_PROFILE"),
  catchError(ProfileController.updateProfile)
);

// Delete profile
router.delete(
  "/:id",
//   checkPermission("DELETE_PROFILE"),
  catchError(ProfileController.deleteProfile)
);

module.exports = router;
