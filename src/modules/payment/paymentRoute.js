const express = require('express');
const router = express.Router();
const paymentController = require('./paymentController');
const catchError = require("../../middlewares/catchError");
const { validateToken } = require("../../middlewares/token");


router.get("/", paymentController.getAllPayments);

router.get("/:userId", paymentController.getPaymentsByUserId);

router.post('/pay/:id',validateToken, catchError(paymentController.createPaymentAndRedirect));

router.post("/Webhook",express.raw({ type: "application/json" }),paymentController.handleWebhook);

module.exports = router;