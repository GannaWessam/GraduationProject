const express = require('express');
const router = express.Router();
const paymentController = require('./paymentController');
const catchError = require("../../middlewares/catchError");
const { validateToken } = require("../../middlewares/token");
const checkPermission = require('../../middlewares/checkPermission');
const { uploadReceiptImage } = require("../../middlewares/UploadSessionMaterial");


router.get("/", validateToken,checkPermission("VIEW_FINANCE"), paymentController.getAllPayments);

router.get(
  "/getAllReceipts/:userId",
  paymentController.getAllReceiptsController
);

router.get("/:userId", paymentController.getPaymentsByUserId);
router.get("/pending/:userId", paymentController.getPendingPaymentsByUserId);

router.post('/pay/:id',validateToken, catchError(paymentController.createPaymentAndRedirect));

router.post("/Webhook",express.raw({ type: "application/json" }),paymentController.handleWebhook);

router.post(
    "/handle-user/:paymentId",
    validateToken,
    catchError(paymentController.handleUserPayment)
  );


router.post(
    "/upload",
    uploadReceiptImage,
    paymentController.uploadReceiptController
  );
  router.get(
    "/pay/fetch",
    paymentController.getReceiptsfromExternal
  )

  router.get(
    "/export/pdfExcel",
    catchError(paymentController.exportPaymentsController)
  );
  


module.exports = router;