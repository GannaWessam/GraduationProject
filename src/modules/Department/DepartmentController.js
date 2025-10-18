const DepartmentService = require("./DepartmentService");
const ApiResponse = require("../../Util/ApiResponse");

async function addDepartment(req, res) {
  const result = await DepartmentService.addDepartment(req.body);
  return res.status(201).json(ApiResponse.created(result));
}

async function getAllDepartmentsController(req, res) {
  const result = await DepartmentService.getAllDepartmentsService(req.query || {});
  return res.status(200).json(ApiResponse.success(result));
}

async function getAllDepartmentsInCollegeController(req, res) {
  const result = await DepartmentService.getAllDepartmentsInCollegeService(req.params.id);
  return res.status(200).json(ApiResponse.success(result));
}

async function getDepartmentById(req, res) {
  const result = await DepartmentService.getDepartmentById(req.params.id);
  return res.status(200).json(ApiResponse.success(result));
}

async function updateDepartment(req, res) {
  const result = await DepartmentService.updateDepartment(req.params.id, req.body);
  return res.status(200).json(ApiResponse.success(result));
}

async function deleteDepartment(req, res) {
  const result = await DepartmentService.deleteDepartment(req.params.id);
  return res.status(200).json(ApiResponse.success(result));
}

module.exports = {
  addDepartment,
  getAllDepartmentsController,
  getAllDepartmentsInCollegeController,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
};