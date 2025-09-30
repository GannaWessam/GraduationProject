// helpers/responseHelper.js
const { splitLang } = require("../../../Helpers/langHelper");

function formatUni(uni) {
  if (!uni) return null;

  const { en, ar } = splitLang(uni.Name);
  const plain = uni.toJSON();
  delete plain.Name;

  return {
    NameEn: en,
    NameAr: ar,
    ...plain,
  };
}

function formatCollege(college) {
  if (!college) return null;

  const { en, ar } = splitLang(college.Name);
  const plain = college.toJSON();
  delete plain.Name;

  return {
    NameEn: en,
    NameAr: ar,
    ...plain,
  };
}

module.exports = { formatUni, formatCollege };
