const { college } = require("../../models");
const ApiFeature = require("../../Util/ApiFeatures");

async function getAllCollegesService(reqQuery = {}) {
  const apiFeature = new ApiFeature(reqQuery)
    .pagination()
    .filter()
    .sort()
    .selectedFields()
    .search();

  const colleges = await college.findAll(apiFeature.options);
  const totalProducts = await college.count();

  return {
    status: 200,
    message: "Products fetched successfully",
    data: colleges,
    meta: {
      page: apiFeature.page,
      limit: apiFeature.limit,
      total: totalProducts,
      totalPages: Math.ceil(totalProducts / apiFeature.limit),
    },
  };
}

async function addCollege(collegeInfo) {
  const { Name } = collegeInfo;
  if (!Name) throw new Error("missing_required");

  const newCollege = await college.create({ Name });
  return newCollege;
}

async function getCollegeById(id) {
  const col = await college.findByPk(id);
  if (!col) throw new Error("not_found");
  return col;
}

async function updateCollege(id, updateInfo) {
  const col = await college.findByPk(id);
  if (!col) throw new Error("not_found");

  if (updateInfo.Name) col.Name = updateInfo.Name;
  await col.save();

  return col;
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