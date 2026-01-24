const PermissionService = require("./PermissionService");
const ApiResponse = require("../../Util/ApiResponse");

async function addPermission(req, res) {
  const result = await PermissionService.addPermission(req.body);
  return res.status(201).json(ApiResponse.created(result));
}

async function getAllPermissionsController(req, res, next) {
  try {
    const result = await PermissionService.getAllPermissionsService(
      req.query || {}
    );
    return res.status(200).json(ApiResponse.success(result));
  } catch (error) {
    return next(error);
  }
}

async function getPermissionById(req, res) {
  const result = await PermissionService.getPermissionById(req.params.id);
  return res.status(200).json(ApiResponse.success(result));
}

async function updatePermission(req, res) {
  const result = await PermissionService.updatePermission(
    req.params.id,
    req.body
  );
  return res.status(200).json(ApiResponse.success(result));
}

async function deletePermission(req, res) {
  const result = await PermissionService.deletePermission(req.params.id);
  return res.status(200).json(ApiResponse.success(result));
}

async function seedPermissionsController(req, res) {
  const result = await PermissionService.seedPermissions(req.body.permissions);
  return res.status(201).json(ApiResponse.created(result));
}

module.exports = {
  addPermission,
  getAllPermissionsController,
  getPermissionById,
  updatePermission,
  deletePermission,
  seedPermissionsController
};
