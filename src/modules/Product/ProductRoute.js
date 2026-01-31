const express = require("express");
const router = express.Router();
const ProductController = require("./ProductController");
const catchError = require("../../middlewares/catchError");
const { validateToken } = require("../../middlewares/token");
const checkPermission= require("../../middlewares/checkPermission");

router.post("/",validateToken,catchError(ProductController.addProduct));
router.get("/", catchError(ProductController.getAllProductsController));
router.get("/:id", catchError(ProductController.getProductById));
router.put("/:id", catchError(ProductController.updateProduct));
router.delete("/:id",validateToken, catchError(ProductController.deleteProduct));

module.exports = router;
