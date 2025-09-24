const express = require('express');
const router = express.Router();
const authController = require('./AuthController');
const { uploadSingleFile } = require("../fileUpload");

router.post('/register',uploadSingleFile("nationalIdImage"), authController.register);
router.post('/login', authController.login);
router.post('/resetPassword', authController.updatePassword);

module.exports = router;