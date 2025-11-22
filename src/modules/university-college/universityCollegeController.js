const UniversityCollegeService = require("./universityCollegeService");
const ApiResponse = require("../../Util/ApiResponse");

async function addUniversityCollege(req, res) {
  const result = await UniversityCollegeService.addUniversityCollege(req.body);
  return res.status(201).json(ApiResponse.created(result));
}

async function getAllUniversityCollegesController(req, res, next) {
  try {
    const result = await UniversityCollegeService.getAllUniversityCollegesService(req.query || {});
    return res.status(200).json(ApiResponse.success(result));
  } catch (error) {
    return next(error);
  }
}

async function getUniversityCollegeById(req, res) {
  const result = await UniversityCollegeService.getUniversityCollegeById(req.params.id);
  return res.status(200).json(ApiResponse.success(result));
}

async function updateUniversityCollege(req, res) {
  const result = await UniversityCollegeService.updateUniversityCollege(req.params.id, req.body);
  return res.status(200).json(ApiResponse.success(result));
}

async function deleteUniversityCollege(req, res) {
  const result = await UniversityCollegeService.deleteUniversityCollege(req.params.id);
  return res.status(200).json(ApiResponse.success(result));
}

async function getCollegesByUniversity(req, res) {
    const result = await UniversityCollegeService.getCollegesByUniversityId(req.params.universityId);
    return res.status(200).json(ApiResponse.success(result));
  }

module.exports = {
  addUniversityCollege,
  getAllUniversityCollegesController,
  getUniversityCollegeById,
  updateUniversityCollege,
  deleteUniversityCollege,
  getCollegesByUniversity
};