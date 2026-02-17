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

async function addUniversityCollege(info, req) {
  const { universityId, collegeId } = info;
  if (!universityId || !collegeId) throw new Error("missing_required");

  const newUC = await university_college.create({ universityId, collegeId });

  if (req && req.audit) {
    req.audit.affectedThing = {
      _id: newUC.id,
      universityId: newUC.universityId,
      collegeId: newUC.collegeId,
    };
    req.audit.message =
      "University-college link created successfully | تم إنشاء ربط الجامعة بالكلية بنجاح";
  }

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

async function updateUniversityCollege(id, updateInfo, req) {
  const uc = await university_college.findByPk(id);
  if (!uc) throw new Error("not_found");

  if (updateInfo.universityId) uc.universityId = updateInfo.universityId;
  if (updateInfo.collegeId) uc.collegeId = updateInfo.collegeId;

  await uc.save();

  if (req && req.audit) {
    req.audit.affectedThing = {
      _id: id,
      universityId: uc.universityId,
      collegeId: uc.collegeId,
    };
    req.audit.message =
      "University-college link updated successfully | تم تحديث ربط الجامعة بالكلية بنجاح";
  }

  return uc;
}

async function deleteUniversityCollege(id, req) {
  const uc = await university_college.findByPk(id);
  if (!uc) throw new Error("not_found");

  await uc.destroy();

  if (req && req.audit) {
    req.audit.affectedThing = {
      _id: id,
      universityId: uc.universityId,
      collegeId: uc.collegeId,
    };
    req.audit.message =
      "University-college link deleted successfully | تم حذف ربط الجامعة بالكلية بنجاح";
  }

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