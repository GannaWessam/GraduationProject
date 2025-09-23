const express = require('express');
const router = express.Router();
const authController = require('./AuthController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/resetPassword', authController.updatePassword);

module.exports = router;