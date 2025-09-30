const { university } = require("../../models");
const ApiFeature = require("../../Util/ApiFeatures");
const { concatLang } = require("../../Helpers/langHelper");
const { formatUni } = require("./helpers/responseHelper");

async function getAllUniversitiesService(reqQuery = {}) {
  const apiFeature = new ApiFeature(reqQuery)
    .pagination()
    .filter()
    .sort()
    .selectedFields()
    .search();

  const { count, rows } = await university.findAndCountAll(apiFeature.options);

  return {
    status: 200,
    message: "Universities fetched successfully",
    data: rows.map(formatUni),
    meta: {
      page: apiFeature.page,
      limit: apiFeature.limit,
      total: count,
      totalPages: Math.ceil(count / apiFeature.limit),
    },
  };
}

async function addUniversity(universityInfo) {
  const { nameEn, nameAr } = universityInfo;
  if (!nameEn || !nameAr) throw new Error("missing_required");

  const newUniversity = await university.create({
    Name: concatLang(nameEn, nameAr),
  });

  return formatUni(newUniversity);
}

async function getUniversityById(id) {
  const uni = await university.findByPk(id);
  if (!uni) throw new Error("not_found");
  return formatUni(uni);
}

async function updateUniversity(id, updateInfo) {
  const uni = await university.findByPk(id);
  if (!uni) throw new Error("not_found");

  if (updateInfo.nameEn || updateInfo.nameAr) {
    // const current = formatUni(uni);
    uni.Name = concatLang(
      updateInfo.nameEn ?? current.nameEn,
      updateInfo.nameAr ?? current.nameAr
    );
  }

  await uni.save();
  return formatUni(uni);
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
