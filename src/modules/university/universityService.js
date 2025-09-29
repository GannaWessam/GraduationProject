const { university } = require("../../models");
const ApiFeature = require("../../Util/ApiFeatures");

async function getAllUniversitiesService(reqQuery = {}) {
  const apiFeature = new ApiFeature(reqQuery)
    .pagination()
    .filter()
    .sort()
    .selectedFields()
    .search();

  const universities = await university.findAll(apiFeature.options);

  return {
    status: 200,
    message: "Universities fetched successfully",
    data: universities,
  };
}

async function addUniversity(universityInfo) {
  const { Name } = universityInfo;
  if (!Name) throw new Error("missing_required");

  const newUniversity = await university.create({ Name });
  return newUniversity;
}

async function getUniversityById(id) {
  const uni = await university.findByPk(id);
  if (!uni) throw new Error("not_found");
  return uni;
}

async function updateUniversity(id, updateInfo) {
  const uni = await university.findByPk(id);
  if (!uni) throw new Error("not_found");

  if (updateInfo.Name) uni.Name = updateInfo.Name;
  await uni.save();

  return uni;
}

async function deleteUniversity(id) {
  const uni = await university.findByPk(id);
  if (!uni) throw new Error("not_found");

  await uni.destroy();
  return { deleted: true };
}

module.exports = {
  addUniversity,
  getAllUniversitiesService,
  getUniversityById,
  updateUniversity,
  deleteUniversity,
};