const ProductService = require("./ProductService");
const ApiResponse = require("../../Util/ApiResponse");

async function addProduct(req, res) {
  const result = await ProductService.addProduct(req.body);
  return res.status(201).json(ApiResponse.created(result));
}

async function getAllProductsController(req, res, next) {
  try {
    const result = await ProductService.getAllProductsService(req.query || {});
    return res.status(200).json(ApiResponse.success(result));
  } catch (error) {
    return next(error);
  }
}


async function getProductById(req, res) {
  const result = await ProductService.getProductById(req.params.id);
  return res.status(200).json(ApiResponse.success(result));
}

async function updateProduct(req, res) {
  const result = await ProductService.updateProduct(req.params.id, req.body);
  return res.status(200).json(ApiResponse.success(result));
}

async function deleteProduct(req, res) {
  const result = await ProductService.deleteProduct(req.params.id);
  return res.status(200).json(ApiResponse.success(result));
}

module.exports = {
  addProduct,
  getAllProductsController,
  getProductById,
  updateProduct,
  deleteProduct,
};
