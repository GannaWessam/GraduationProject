const express = require("express");
const router = express.Router();
const ReceiptController = require("./ReceiptsController");
const catchError = require("../../../middlewares/catchError");
const { validateToken } = require("../../../middlewares/token");
const checkPermission = require("../../../middlewares/checkPermission");

router.get(
    "/",
    validateToken,
    checkPermission("VIEW_FINANCE"),
    catchError(ReceiptController.getAll),
  );

module.exports = router