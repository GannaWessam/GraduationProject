const { college } = require("../../models");
const ApiFeature = require("../../Util/ApiFeatures");
const { concatLang } = require("../../Helpers/langHelper");
const { formatCollege } = require("./helpers/responseHelper");

async function getAllCollegesService(reqQuery = {}) {
  const apiFeature = new ApiFeature(reqQuery)
    .pagination()
    .filter()
    .sort()
    .selectedFields()
    .search();

  const { count, rows } = await college.findAndCountAll(apiFeature.options);

  return {
    status: 200,
    message: "Colleges fetched successfully",
    data: rows.map(formatCollege),
    meta: {
      page: apiFeature.page,
      limit: apiFeature.limit,
      total: count,
      totalPages: Math.ceil(count / apiFeature.limit),
    },
  };
}

async function addCollege(collegeInfo) {
  const { nameEn, nameAr } = collegeInfo;
  if (!nameEn || !nameAr) throw new Error("missing_required");

  const newCollege = await college.create({
    Name: concatLang(nameEn, nameAr),
  });

  return formatCollege(newCollege);
}

async function getCollegeById(id) {
  const col = await college.findByPk(id);
  if (!col) throw new Error("not_found");
  return formatCollege(col);
}

async function updateCollege(id, updateInfo) {
  const col = await college.findByPk(id);
  if (!col) throw new Error("not_found");

  if (updateInfo.nameEn || updateInfo.nameAr) {
    const current = formatCollege(col);
    col.Name = concatLang(
      updateInfo.nameEn ?? current.nameEn,
      updateInfo.nameAr ?? current.nameAr
    );
  }

  await col.save();
  return formatCollege(col);
}

async function deleteCollege(id) {
  const col = await college.findByPk(id);
  if (!col) throw new Error("not_found");

  await col.destroy();
  return { deleted: true };
}

module.exports = {
  addCollege,
  getAllCollegesService,
  getCollegeById,
  updateCollege,
  deleteCollege,
};
