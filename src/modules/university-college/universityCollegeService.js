const { university_college, university, college } = require("../../models");
const ApiFeature = require("../../Util/ApiFeatures");

const { formatCollege } = require("./helpers/responseHelper");

async function getAllUniversityCollegesService(reqQuery = {}) {
  const apiFeature = new ApiFeature(reqQuery)
    .pagination()
    .filter()
    .sort()
    .selectedFields();

  const data = await university_college.findAll({
    ...apiFeature.options,
    include: [
      { model: university, attributes: ["UniversityId", "Name"] },
      { model: college, attributes: ["collegeId", "Name"] },
    ],
  });

  return {
    status: 200,
    message: "University-College links fetched successfully",
    data,
  };
}

async function addUniversityCollege(info) {
  const { universityId, collegeId } = info;
  if (!universityId || !collegeId) throw new Error("missing_required");

  const newUC = await university_college.create({ universityId, collegeId });
  return newUC;
}

async function getUniversityCollegeById(id) {
  const uc = await university_college.findByPk(id, {
    include: [
      { model: university, attributes: ["UniversityId", "Name"] },
      { model: college, attributes: ["collegeId", "Name"] },
    ],
  });
  if (!uc) throw new Error("not_found");
  return uc;
}

async function updateUniversityCollege(id, updateInfo) {
  const uc = await university_college.findByPk(id);
  if (!uc) throw new Error("not_found");

  if (updateInfo.universityId) uc.universityId = updateInfo.universityId;
  if (updateInfo.collegeId) uc.collegeId = updateInfo.collegeId;

  await uc.save();
  return uc;
}

async function deleteUniversityCollege(id) {
  const uc = await university_college.findByPk(id);
  if (!uc) throw new Error("not_found");

  await uc.destroy();
  return { deleted: true };
}
  
async function getCollegesByUniversityId(universityId) {
  const colleges = await college.findAll({
    include: [
      {
        model: university_college,
        where: { universityId },
        attributes: [],
      },
    ],
    attributes: ["collegeId", "Name"],
  });

  return {
    status: 200,
    message: "Colleges fetched successfully",
    data: colleges.map(formatCollege), 
  };
}
module.exports = {
  addUniversityCollege,
  getAllUniversityCollegesService,
  getUniversityCollegeById,
  updateUniversityCollege,
  deleteUniversityCollege,
  getCollegesByUniversityId
};