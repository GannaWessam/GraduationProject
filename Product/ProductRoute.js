const express = require('express');
const router = express.Router();
const ProductController = require('./ProductController');

router.post('/Product/addProduct', ProductController.addProduct);
router.post('/Product/getProductByType', ProductController.getProductByType);


module.exports = router;