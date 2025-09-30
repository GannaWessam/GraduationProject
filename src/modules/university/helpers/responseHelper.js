const { splitLang } = require("../../../Helpers/langHelper");

function formatUni(uni) {
  if (!uni) return null;

  const { en, ar } = splitLang(uni.Name); // splitLang returns { en, ar }

  const plain = uni.toJSON();
  delete plain.Name; 

  return {
    NameEn: en, // ✅ English on the left
    NameAr: ar, // ✅ Arabic on the right
    ...plain,
  };
}

module.exports = { formatUni };
