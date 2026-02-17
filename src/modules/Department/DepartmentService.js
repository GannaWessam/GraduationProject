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

async function getAllDepartmentsInCollegeService(id) {

  const departments = await Department.findAll({where:{CollegeId : id}});
  const totalDepartments = await Department.count();

  return PaginatedResponse.fromApiFeature(
    totalDepartments,
    departments,
    "Departments fetched successfully"
  );
}

async function addDepartment(departmentInfo, req) {
  const { Name, CollegeId } = departmentInfo;

  if (!Name || !CollegeId) throw new Error("missing_required");

  const newDepartment = await Department.create({ Name, CollegeId });

  if (req && req.audit) {
    req.audit.affectedThing = {
      _id: newDepartment.DepartmentId,
      name: newDepartment.Name,
    };
    req.audit.message =
      "Department created successfully | تم إنشاء القسم بنجاح";
  }

  return newDepartment;
}

async function getDepartmentById(id) {
  const department = await Department.findByPk(id, {
    include: [{ model: College, as: "college" }],
  });
  if (!department) throw new Error("not_found");
  return department;
}

async function updateDepartment(id, updateInfo, req) {
  const department = await Department.findByPk(id);
  if (!department) throw new Error("not_found");

  if (updateInfo.Name) department.Name = updateInfo.Name;
  if (updateInfo.CollegeId) department.CollegeId = updateInfo.CollegeId;

  await department.save();

  if (req && req.audit) {
    req.audit.affectedThing = {
      _id: department.DepartmentId,
      name: department.Name,
    };
    req.audit.message =
      "Department updated successfully | تم تحديث القسم بنجاح";
  }

  return department;
}

async function deleteDepartment(id, req) {
  const department = await Department.findByPk(id);
  if (!department) throw new Error("not_found");
  await department.destroy();

  if (req && req.audit) {
    req.audit.affectedThing = {
      _id: id,
      name: department.Name,
    };
    req.audit.message =
      "Department deleted successfully | تم حذف القسم بنجاح";
  }

  return { deleted: true };
}

module.exports = {
  getAllDepartmentsService,
  getAllDepartmentsInCollegeService,
  addDepartment,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
};