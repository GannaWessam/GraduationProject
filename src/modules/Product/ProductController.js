const ProductService = require("./ProductService");
const ApiResponse = require("../../Util/ApiResponse");

async function addProduct(req, res) {
  const result = await ProductService.addProduct(req.body);
  return res.status(201).json(ApiResponse.created(result));
}

async function getProductByType(req, res) {
  const result = await ProductService.getProductByType(req.body.type , req.body.nationality);
  return res.status(200).json(ApiResponse.success(result));
}

module.exports = { addProduct, getProductByType };
