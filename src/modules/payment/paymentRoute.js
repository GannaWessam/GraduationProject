const express = require('express');
const router = express.Router();
const paymentController = require('./paymentController');

router.post('/pay', paymentController.createPaymentAndRedirect);

module.exports = router;