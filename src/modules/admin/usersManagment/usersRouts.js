const express = require("express");
const router = express.Router();
const authController = require("../../Auth/AuthController");
const usersController = require("./usersController");
const { uploadSingleFile } = require("../../../fileUpload");
const { validateToken } = require("../../../middlewares/token");
const catchError = require("../../../middlewares/catchError");

// Add new user (with file upload)
router.post("/addAdmin",
  catchError(usersController.addAdmin)
);

router.post(
  "/addUser",
  uploadSingleFile("nationalIdImage"),
  catchError(authController.register)
);

router.get(
  "/byStatus",
  validateToken,
  catchError(usersController.getAllUsersByStatus)
);

router.get(
  "/:id",
  validateToken,
  catchError(usersController.getUserById)
);


router.get(
  "/",
  validateToken,
  catchError(usersController.getAllUsers)
);


router.delete(
  "/delete/:id",
  validateToken,
  catchError(usersController.deleteUserById)
);

router.put(
  "/:id",
  validateToken,
  uploadSingleFile("nationalIdImage"),
  catchError(usersController.updateUser)
)

router.put(
  "/approve/:id", 
  validateToken,
  catchError(usersController.approveStudentByUserId)
);

module.exports = router;    