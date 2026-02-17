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

async function addUniversity(universityInfo, req) {
  const { nameEn, nameAr } = universityInfo;
  if (!nameEn || !nameAr) throw new Error("missing_required");

  const newUniversity = await university.create({
    Name: concatLang(nameEn, nameAr),
  });

  const formatted = formatUni(newUniversity);

  if (req && req.audit) {
    req.audit.affectedThing = {
      _id: newUniversity.UniversityId,
      name: formatted.nameEn,
    };
    req.audit.message =
      "University created successfully | تم إنشاء الجامعة بنجاح";
  }

  return formatted;
}

async function getUniversityById(id) {
  const uni = await university.findByPk(id);
  if (!uni) throw new Error("not_found");
  return formatUni(uni);
}

async function updateUniversity(id, updateInfo, req) {
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
  const formatted = formatUni(uni);

  if (req && req.audit) {
    req.audit.affectedThing = {
      _id: id,
      name: formatted.nameEn,
    };
    req.audit.message =
      "University updated successfully | تم تحديث الجامعة بنجاح";
  }

  return formatted;
}

async function deleteUniversity(id, req) {
  const uni = await university.findByPk(id);
  if (!uni) throw new Error("not_found");

  await uni.destroy();

  if (req && req.audit) {
    const formatted = formatUni(uni);
    req.audit.affectedThing = {
      _id: id,
      name: formatted.nameEn,
    };
    req.audit.message =
      "University deleted successfully | تم حذف الجامعة بنجاح";
  }

  return { deleted: true };
}

module.exports = {
  addUniversity,
  getAllUniversitiesService,
  getUniversityById,
  updateUniversity,
  deleteUniversity,
};
