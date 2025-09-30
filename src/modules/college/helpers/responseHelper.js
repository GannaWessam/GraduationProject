const { splitLang } = require("../../../Helpers/langHelper");

function formatCollege(col) {
  if (!col) return null;
  const plain = col.toJSON();

  const { en, ar } = splitLang(plain.Name);
  delete plain.Name;

  return {
    ...plain,
    nameEn: en,
    nameAr: ar,
  };
}

module.exports = { formatCollege };
