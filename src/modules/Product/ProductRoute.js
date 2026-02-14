const express = require("express");
const router = express.Router();
const ProductController = require("./ProductController");
const catchError = require("../../middlewares/catchError");
const { validateToken } = require("../../middlewares/token");
const checkPermission = require("../../middlewares/checkPermission");

router.post(
  "/",
  validateToken,
  checkPermission("ADD_PRODUCT"),
  catchError(ProductController.addProduct)
);
router.get(
  "/",
  validateToken,
  checkPermission("VIEW_PRODUCT"),
  catchError(ProductController.getAllProductsController)
);
router.get(
  "/:id",
  validateToken,
  checkPermission("VIEW_PRODUCT"),
  catchError(ProductController.getProductById)
);
router.put(
  "/:id",
  validateToken,
  checkPermission("EDIT_PRODUCT"),
  catchError(ProductController.updateProduct)
);
router.delete(
  "/:id",
  validateToken,
  checkPermission("DELETE_PRODUCT"),
  catchError(ProductController.deleteProduct)
);

module.exports = router;
