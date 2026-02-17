const express = require('express');
const router = express.Router();
const paymentController = require('./paymentController');
const catchError = require("../../middlewares/catchError");
const { validateToken } = require("../../middlewares/token");

router.post('/pay',validateToken, catchError(paymentController.createPaymentAndRedirect));

module.exports = router;