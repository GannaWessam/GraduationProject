const express = require('express');
const router = express.Router();
const authController = require('./AuthController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/resetPassword', authController.updatePassword);
router.post("/send-otp", authController.sendOtp)
router.post("/verify-otp", authController.verifyOTP)

module.exports = router;