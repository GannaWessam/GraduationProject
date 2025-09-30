
const { splitLang } = require("../../../Helpers/langHelper");

function formatProduct(product) {
  if (!product) return null;

  const { en, ar } = splitLang(product.courseName);

  const plain = product.toJSON();
  delete plain.courseName; 

  return {
    courseNameEn: en,
    courseNameAr: ar,
    ...plain,
    
  };
}


module.exports = { formatProduct };
