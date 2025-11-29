const { Product, ProductAllowedUserType } = require("../../models");
const ApiFeature = require("../../Util/ApiFeatures");
const { Op } = require("sequelize");
const { concatLang } = require("../../Helpers/langHelper");
const { formatProduct } = require("./helpers/responseHelper");
const PaginatedResponse = require("../../Util/PaginatedResponse");

async function getAllProductsService(reqQuery = {}) {
  const apiFeature = new ApiFeature(reqQuery)
    .pagination()
    .filter()
    .sort()
    .selectedFields()
    .search();

  if (apiFeature.options.where?.userType) {
    delete apiFeature.options.where.userType;
  }

  let allowedUserTypeWhere = undefined;
  if (reqQuery.userType) {
    let types = Array.isArray(reqQuery.userType)
      ? reqQuery.userType
      : [reqQuery.userType];

    allowedUserTypeWhere = { userType: { [Op.in]: types } };
  }

  apiFeature.options.include = [
    {
      model: ProductAllowedUserType,
      as: "allowedUserTypes",
      attributes: ["userType"],
      where: allowedUserTypeWhere,
      required: !!allowedUserTypeWhere,
    },
  ];

  const products = await Product.findAll(apiFeature.options);
  const totalProducts = await Product.count();

  return PaginatedResponse.fromApiFeature(
    apiFeature,
    totalProducts,
    products.map(formatProduct),
    "Products fetched successfully"
  );
}

async function addProduct(productInfo) {
  const {
    courseNameEn,
    courseNameAr,
    priceEgyptian,
    priceOther,
    requirdCourses,
    allowedUserTypes = [],
  } = productInfo;

  if (!courseNameEn || !courseNameAr || !priceEgyptian || !priceOther) {
    throw new Error("missing_required");
  }

  const newProduct = await Product.create(
    {
      courseName: concatLang(courseNameEn, courseNameAr), // ✅ concat before saving
      priceEgyptian,
      priceOther,
      requirdCourses,
      allowedUserTypes: allowedUserTypes.map((type) => ({ userType: type })),
    },
    {
      include: [{ model: ProductAllowedUserType, as: "allowedUserTypes" }],
    }
  );

  return formatProduct(newProduct);
}

async function getProductById(id) {
  const product = await Product.findByPk(id, {
    include: [{ model: ProductAllowedUserType, as: "allowedUserTypes",attributes:["userType"] }],
  });

  if (!product) throw new Error("not_found");
  return formatProduct(product); // ✅ ensure split
}

async function updateProduct(id, updateInfo) {
  const { courseNameEn, courseNameAr, priceEgyptian, priceOther, allowedUserTypes,requirdCourses } =
    updateInfo;

  const product = await Product.findByPk(id, {
    include: [{ model: ProductAllowedUserType, as: "allowedUserTypes" }],
  });
  if (!product) throw new Error("not_found");

  if (courseNameEn || courseNameAr) {
    product.courseName = concatLang(courseNameEn, courseNameAr); 
  }
  if (priceEgyptian) product.priceEgyptian = priceEgyptian;
  if (priceOther) product.priceOther = priceOther;
  if(requirdCourses) product.requirdCourses=requirdCourses

  await product.save();

  if (allowedUserTypes) {

    await ProductAllowedUserType.destroy({ where: { productId: id } });
  
    await ProductAllowedUserType.bulkCreate(
      allowedUserTypes.map((type) => ({
        productId: id,
        userType: String(type),
      }))
    );
  }

  const updated = await Product.findByPk(id, {
    include: [{ model: ProductAllowedUserType, as: "allowedUserTypes" }],
  });

  return formatProduct(updated); d
}

async function deleteProduct(id) {
  const product = await Product.findByPk(id);
  if (!product) throw new Error("not_found");
  await product.destroy();
  return { deleted: true };
}

module.exports = {
  addProduct,
  getAllProductsService,
  getProductById,
  updateProduct,
  deleteProduct,
};
