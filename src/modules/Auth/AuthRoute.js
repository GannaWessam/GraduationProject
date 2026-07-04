const express = require("express");
const router = express.Router();
const authController = require("./AuthController");
const { uploadSingleFile , uploadMultipleFiles} = require("../../fileUpload");
const catchError = require("../../middlewares/catchError");

router.post(
  "/register",
  uploadMultipleFiles([
    { name: "nationalIdImage", maxCount: 1 },
    { name: "id_image_back", maxCount: 1 },
  ]),
  authController.register
);

router.post("/login", authController.login);
router.post("/resetPassword", authController.updatePassword);
router.post("/send-otp", catchError(authController.sendOtp));
router.post("/verify-otp", catchError(authController.verifyOTP));
router.get("/getUser", authController.getUser);
router.get("/getUserFees", authController.getUserFees);
router.post("/verify-email", catchError(authController.verifyEmail));
router.post("/generate-qr", catchError(authController.generateQrController));


module.exports = router;
