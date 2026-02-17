const { Product, ProductAllowedUserType, currency } = require("../../models");
const ApiFeature = require("../../Util/ApiFeatures");
const { Op } = require("sequelize");
const { concatLang } = require("../../Helpers/langHelper");
const { formatProduct } = require("./helpers/responseHelper");
const PaginatedResponse = require("../../Util/PaginatedResponse");
const logger = require("../../Util/logger");
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
    {
      model: currency,
      attributes: ["code"],
      required: false,
    },
  ];

  const products = await Product.findAll(apiFeature.options);
  const totalProducts = await Product.count();

  return PaginatedResponse.fromApiFeature(
    apiFeature,
    totalProducts,
    products.map(formatProduct),
    "Products fetched successfully",
  );
}

async function addProduct(productInfo, req) {
  const {
    courseNameEn,
    courseNameAr,
    priceEgyptian,
    priceOther,
    currencyId,
    requirdCourses,
    allowedUserTypes = [],
  } = productInfo;

  if (
    !courseNameEn ||
    !courseNameAr ||
    !priceEgyptian ||
    !priceOther ||
    !currencyId
  ) {
    throw new Error("missing_required");
  }

  const Currency = await currency.findByPk(currencyId);
  if (!Currency) {
    throw new Error("currency_not_found");
  }

  const newProduct = await Product.create(
    {
      courseName: concatLang(courseNameEn, courseNameAr), // ✅ concat before saving
      priceEgyptian,
      priceOther,
      currencyId,
      requirdCourses,
      allowedUserTypes: allowedUserTypes.map((type) => ({ userType: type })),
    },
    {
      include: [{ model: ProductAllowedUserType, as: "allowedUserTypes" }],
    },
  );

  req.audit.affectedThing = {
    _id: newProduct.dataValues.productId,
    name: newProduct.dataValues.courseName,
  };

  req.audit.message =
    "Product added successfully | تم إضافة المنتج بنجاح";
  return formatProduct(newProduct);
}

async function getProductById(id) {
  const product = await Product.findByPk(id, {
    include: [
      {
        model: ProductAllowedUserType,
        as: "allowedUserTypes",
        attributes: ["userType"],
      },
      { model: currency },
    ],
  });

  if (!product) throw new Error("not_found");
 
  return formatProduct(product);
}

async function updateProduct(id, updateInfo,req) {
  const {
    courseNameEn,
    courseNameAr,
    priceEgyptian,
    priceOther,
    allowedUserTypes,
    requirdCourses,
    currencyId,
  } = updateInfo;

  const product = await Product.findByPk(id, {
    include: [{ model: ProductAllowedUserType, as: "allowedUserTypes" }],
  });
  if (!product) throw new Error("not_found");

  if (courseNameEn || courseNameAr) {
    product.courseName = concatLang(courseNameEn, courseNameAr);
  }
  if (priceEgyptian) product.priceEgyptian = priceEgyptian;
  if (priceOther) product.priceOther = priceOther;
  if (requirdCourses) product.requirdCourses = requirdCourses;
  if (currencyId) {
    const Currency = await currency.findByPk(currencyId);
    if (!Currency) {
      throw new Error("currency_not_found");
    }
    product.currencyId = currencyId;
  }

  await product.save();

  if (allowedUserTypes) {
    await ProductAllowedUserType.destroy({ where: { productId: id } });

    await ProductAllowedUserType.bulkCreate(
      allowedUserTypes.map((type) => ({
        productId: id,
        userType: String(type),
      })),
    );
  }

  const updated = await Product.findByPk(id, {
    include: [{ model: ProductAllowedUserType, as: "allowedUserTypes" }],
  });

  req.audit.affectedThing = {
    _id: product.dataValues.productId,
    name: product.courseName,
  };

  req.audit.message =
    "Product updated successfully | تم تحديث بيانات المنتج بنجاح";
  return formatProduct(updated);
}

async function deleteProduct(id,req) {
  const product = await Product.findByPk(id);
  if (!product) throw new Error("not_found");
const productName = product.courseName;
  await product.destroy();
  console.log(product);
  
  req.audit.affectedThing = {
    _id: product.dataValues.productId,
    name: productName,
  };

  req.audit.message =
    "Product deleted successfully | تم حذف المنتج بنجاح";
}

module.exports = {
  addProduct,
  getAllProductsService,
  getProductById,
  updateProduct,
  deleteProduct,
};
