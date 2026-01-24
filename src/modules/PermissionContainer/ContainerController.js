const ContainerService = require("./ContainerService");
const ApiResponse = require("../../Util/ApiResponse");

async function addContainer(req, res) {
  const result = await ContainerService.addContainer(req.body);
  return res.status(201).json(ApiResponse.created(result));
}

async function getAllContainersController(req, res) {
  const result = await ContainerService.getAllContainers();
  return res.status(200).json(ApiResponse.success(result));
}

async function getContainerById(req, res) {
  const result = await ContainerService.getContainerById(req.params.id);
  return res.status(200).json(ApiResponse.success(result));
}

async function updateContainer(req, res) {
  const result = await ContainerService.updateContainer(req.params.id, req.body);
  return res.status(200).json(ApiResponse.success(result));
}

async function deleteContainer(req, res) {
  const result = await ContainerService.deleteContainer(req.params.id);
  return res.status(200).json(ApiResponse.success(result));
}

module.exports = {
  addContainer,
  getAllContainersController,
  getContainerById,
  updateContainer,
  deleteContainer,
};
