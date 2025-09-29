const UniversityService = require("./universityService");
const ApiResponse = require("../../Util/ApiResponse");

async function addUniversity(req, res) {
  const result = await UniversityService.addUniversity(req.body);
  return res.status(201).json(ApiResponse.created(result));
}

async function getAllUniversitiesController(req, res) {
  try {
    const result = await UniversityService.getAllUniversitiesService(req.query || {});
    return res.status(200).json(ApiResponse.success(result));
  } catch (err) {
    return res
      .status(500)
      .json(ApiResponse.error(err.message || "Internal Server Error"));
  }
}

async function getUniversityById(req, res) {
  const result = await UniversityService.getUniversityById(req.params.id);
  return res.status(200).json(ApiResponse.success(result));
}

async function updateUniversity(req, res) {
  const result = await UniversityService.updateUniversity(req.params.id, req.body);
  return res.status(200).json(ApiResponse.success(result));
}

async function deleteUniversity(req, res) {
  const result = await UniversityService.deleteUniversity(req.params.id);
  return res.status(200).json(ApiResponse.success(result));
}

module.exports = {
  addUniversity,
  getAllUniversitiesController,
  getUniversityById,
  updateUniversity,
  deleteUniversity,
};