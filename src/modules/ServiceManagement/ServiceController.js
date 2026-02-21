const ServiceService = require("./ServiceService");
const ApiResponse = require("../../Util/ApiResponse");

async function addService(req, res, next) {
  try {
    const result = await ServiceService.addService(req.body, req);
    return res.status(201).json(ApiResponse.created(result));
  } catch (error) {
    next(error);
  }
}

async function getAllServices(req, res, next) {
  try {
    const result = await ServiceService.getAllServicesService(req.query);
    return res.status(200).json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
}

async function getServiceById(req, res, next) {
  try {
    const result = await ServiceService.getServiceById(req.params.id);
    return res.status(200).json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
}

async function updateService(req, res, next) {
  try {
    const result = await ServiceService.updateService(
      req.params.id,
      req.body,
      req
    );
    return res.status(200).json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
}

async function deleteService(req, res, next) {
  try {
    await ServiceService.deleteService(req.params.id, req);
    return res.status(200).json(ApiResponse.success("Deleted successfully"));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  addService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
};