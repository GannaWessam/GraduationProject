const { Department, College } = require("../../models");
const ApiFeature = require("../../Util/ApiFeatures");
const PaginatedResponse = require("../../Util/PaginatedResponse");
const { Op } = require("sequelize");

async function getAllDepartmentsService(reqQuery = {}) {
  const apiFeature = new ApiFeature(reqQuery)
    .pagination()
    .filter()
    .sort()
    .selectedFields()
    .search(["Name"]);


  const departments = await Department.findAll(apiFeature.options);
  const totalDepartments = await Department.count();

  return PaginatedResponse.fromApiFeature(
    apiFeature,
    totalDepartments,
    departments,
    "Departments fetched successfully"
  );
}

async function addDepartment(departmentInfo) {
  const { Name, CollegeId } = departmentInfo;

  if (!Name || !CollegeId) throw new Error("missing_required");

  const newDepartment = await Department.create({ Name, CollegeId });
  return newDepartment;
}

async function getDepartmentById(id) {
  const department = await Department.findByPk(id, {
    include: [{ model: College, as: "college" }],
  });
  if (!department) throw new Error("not_found");
  return department;
}

async function updateDepartment(id, updateInfo) {
  const department = await Department.findByPk(id);
  if (!department) throw new Error("not_found");

  if (updateInfo.Name) department.Name = updateInfo.Name;
  if (updateInfo.CollegeId) department.CollegeId = updateInfo.CollegeId;

  await department.save();
  return department;
}

async function deleteDepartment(id) {
  const department = await Department.findByPk(id);
  if (!department) throw new Error("not_found");
  await department.destroy();
  return { deleted: true };
}

module.exports = {
  getAllDepartmentsService,
  addDepartment,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
};