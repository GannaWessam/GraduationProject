const express = require('express');
const router = express.Router();
const notificationController = require('./NotificationController');

// Subscribe user
router.post('/subscribe', notificationController.subscribeUser);

// Send to a single user
router.post('/send/:userId', notificationController.sendToSingleUser);

// Send to multiple users
router.post('/send', notificationController.sendToMultipleUsers);

module.exports = router;
