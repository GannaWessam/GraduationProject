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

async function addCollege(collegeInfo, req) {
  const { nameEn, nameAr } = collegeInfo;
  if (!nameEn || !nameAr) throw new Error("missing_required");

  const newCollege = await college.create({
    Name: concatLang(nameEn, nameAr),
  });

  const formatted = formatCollege(newCollege);

  if (req && req.audit) {
    req.audit.affectedThing = {
      _id: newCollege.collegeId,
      name: formatted.nameEn,
    };
    req.audit.message =
      "College created successfully | تم إنشاء الكلية بنجاح";
  }

  return formatted;
}

async function getCollegeById(id) {
  const col = await college.findByPk(id);
  if (!col) throw new Error("not_found");
  return formatCollege(col);
}

async function updateCollege(id, updateInfo, req) {
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
  const formatted = formatCollege(col);

  if (req && req.audit) {
    req.audit.affectedThing = {
      _id: id,
      name: formatted.nameEn,
    };
    req.audit.message =
      "College updated successfully | تم تحديث الكلية بنجاح";
  }

  return formatted;
}

async function deleteCollege(id, req) {
  const col = await college.findByPk(id);
  if (!col) throw new Error("not_found");

  await col.destroy();

  if (req && req.audit) {
    const formatted = formatCollege(col);
    req.audit.affectedThing = {
      _id: id,
      name: formatted.nameEn,
    };
    req.audit.message =
      "College deleted successfully | تم حذف الكلية بنجاح";
  }

  return { deleted: true };
}

module.exports = {
  addCollege,
  getAllCollegesService,
  getCollegeById,
  updateCollege,
  deleteCollege,
};
