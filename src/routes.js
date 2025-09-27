const express = require("express");
const authRoutes = require("./modules/Auth/AuthRoute");
const productRoutes = require("./modules/Product/ProductRoute");
const { validateToken } = require("./middlewares/token");

const router = express.Router();


router.use("/api", authRoutes);
router.use("/api/products", validateToken, productRoutes);
module.exports = router;
