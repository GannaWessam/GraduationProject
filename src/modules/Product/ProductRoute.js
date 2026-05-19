const express = require("express");
const router = express.Router();
const ProductController = require("./ProductController");
const catchError = require("../../middlewares/catchError");
const { validateToken } = require("../../middlewares/token");
const checkPermission = require("../../middlewares/checkPermission");

router.post(
  "/",
 
  catchError(ProductController.addProduct)
);
router.get(
  "/",
  catchError(ProductController.getAllProductsController)
);
router.get(
  "/view",
  catchError(ProductController.getAllProductsForViewController)
);
router.get(
  "/:id",
  validateToken,
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

router.put(
  "/:id/status",
  validateToken,
  checkPermission("EDIT_PRODUCT"),
  catchError(ProductController.toggleProductStatus)
);

module.exports = router;
