const express = require("express");
const router = express.Router();
const ProductController = require("./ProductController");
const catchError = require("../../middlewares/catchError");

router.post("/", catchError(ProductController.addProduct));
router.get("/", catchError(ProductController.getAllProductsController));
router.get("/:id", catchError(ProductController.getProductById));
router.put("/:id", catchError(ProductController.updateProduct));
router.delete("/:id", catchError(ProductController.deleteProduct));

module.exports = router;
