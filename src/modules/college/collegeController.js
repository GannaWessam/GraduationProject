const CollegeService = require("./collegeService");
const ApiResponse = require("../../Util/ApiResponse");

async function addCollege(req, res) {
  const result = await CollegeService.addCollege(req.body);
  return res.status(201).json(ApiResponse.created(result));
}

async function getAllCollegesController(req, res, next) {
  try {
    const result = await CollegeService.getAllCollegesService(req.query || {});
    return res.status(200).json(ApiResponse.success(result));
  } catch (error) {
    return next(error);
  }
}

async function getCollegeById(req, res) {
  const result = await CollegeService.getCollegeById(req.params.id);
  return res.status(200).json(ApiResponse.success(result));
}

async function updateCollege(req, res) {
  const result = await CollegeService.updateCollege(req.params.id, req.body);
  return res.status(200).json(ApiResponse.success(result));
}

async function deleteCollege(req, res) {
  const result = await CollegeService.deleteCollege(req.params.id);
  return res.status(200).json(ApiResponse.success(result));
}

module.exports = {
  addCollege,
  getAllCollegesController,
  getCollegeById,
  updateCollege,
  deleteCollege,
};