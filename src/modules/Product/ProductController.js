const ProductService = require("./ProductService");
const ApiResponse = require("../../Util/ApiResponse");

async function addProduct(req, res, next) {
  try {
  

    const reqUser = req.userData;

    const result = await ProductService.addProduct(req.body, req);

    return res.status(201).json(ApiResponse.created(result));
  } catch (error) {
    return next(error);
  }
}

async function getAllProductsController(req, res, next) {
  try {
   


    const result = await ProductService.getAllProductsService(
      req.query || {},
     
    );

    return res.status(200).json(ApiResponse.success(result));
  } catch (error) {
    return next(error);
  }
}


async function getProductById(req, res, next) {
  try {
   

    const result = await ProductService.getProductById(
      req.params.id,
    );

    return res.status(200).json(ApiResponse.success(result));
  } catch (error) {
    return next(error);
  }
}
async function updateProduct(req, res, next) {
  try {


    const result = await ProductService.updateProduct(
      req.params.id,
      req.body,
      req
    );

    return res.status(200).json(ApiResponse.success(result));
  } catch (error) {
    return next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {


    const result = await ProductService.deleteProduct(
      req.params.id,
      req
    );

    return res.status(200).json(ApiResponse.success(result));
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  addProduct,
  getAllProductsController,
  getProductById,
  updateProduct,
  deleteProduct,
};
