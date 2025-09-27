const express = require("express");
const router = express.Router();
const ProductController = require("./ProductController");

const catchError = require("../../middlewares/catchError");

router.post("/add", catchError(ProductController.addProduct));
router.get("/by-type", catchError(ProductController.getProductByType));

module.exports = router;
