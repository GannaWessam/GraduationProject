const express = require("express");
const router = express.Router();
const authController = require("./AuthController");
const { uploadSingleFile } = require("../../fileUpload");
const catchError = require("../../middlewares/catchError");


router.post(
  "/register",

  uploadSingleFile("nationalIdImage"),
  authController.register
);

router.post("/login", authController.login);
router.post("/resetPassword", authController.updatePassword);
router.post("/send-otp", catchError(authController.sendOtp));
router.post("/verify-otp", catchError(authController.verifyOTP));
router.get("/getUser", authController.getUser);
router.get("/getUserFees", authController.getUserFees);
router.post("/verify-email", catchError(authController.verifyEmail));

module.exports = router;
