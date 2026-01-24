const ProfileService = require("./ProfileService");
const ApiResponse = require("../../Util/ApiResponse");

async function addProfile(req, res) {
  const result = await ProfileService.addProfile(req.body);
  return res.status(201).json(ApiResponse.created(result));
}

async function getAllProfilesController(req, res, next) {
  try {
    const result = await ProfileService.getAllProfilesService(req.query || {});
    return res.status(200).json(ApiResponse.success(result));
  } catch (error) {
    return next(error);
  }
}

async function getProfileById(req, res) {
  const result = await ProfileService.getProfileById(req.params.id);
  return res.status(200).json(ApiResponse.success(result));
}

async function updateProfile(req, res) {
  const result = await ProfileService.updateProfile(req.params.id, req.body);
  return res.status(200).json(ApiResponse.success(result));
}

async function deleteProfile(req, res) {
  const result = await ProfileService.deleteProfile(req.params.id);
  return res.status(200).json(ApiResponse.success(result));
}

module.exports = {
  addProfile,
  getAllProfilesController,
  getProfileById,
  updateProfile,
  deleteProfile,
};
