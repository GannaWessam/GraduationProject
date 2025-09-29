const { spread } = require("axios");
const { Product, ProductAllowedUserType } = require("../../models");

const ApiFeature = require("../../Util/ApiFeatures");
const { Op } = require("sequelize");

async function getAllProductsService(reqQuery = {}) {
  const apiFeature = new ApiFeature(reqQuery)
    .pagination()
    .filter()
    .sort()
    .selectedFields()
    .search();

  // remove `userType` from product-level filter
  if (apiFeature.options.where?.userType) {
    delete apiFeature.options.where.userType;
  }

  // Handle allowed user types
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
      required: !!allowedUserTypeWhere, // inner join if filtering
    },
  ];

  const products = await Product.findAll(apiFeature.options);

  return {
    status: 200,
    message: "Products fetched successfully",
    data: products,
  };
}



async function addProduct(productInfo) {
  const {
    courseName,
    priceEgyptian,
    priceOther,
    allowedUserTypes = [],
  } = productInfo;

  if (!courseName || !priceEgyptian || !priceOther) {
    throw new Error("missing_required");
  }

  const newProduct = await Product.create(
    {
      courseName,
      priceEgyptian,
      priceOther,
      allowedUserTypes: allowedUserTypes.map((type) => ({ userType: type })),
    },
    {
      include: [{ model: ProductAllowedUserType, as: "allowedUserTypes" }],
    }
  );

  return newProduct;
}

async function getProductById(id) {
  const product = await Product.findByPk(id, {
    include: [{ model: ProductAllowedUserType, as: "allowedUserTypes" }],
  });

  if (!product) throw new Error("not_found");
  return product;
}

async function updateProduct(id, updateInfo) {
  const { courseName, priceEgyptian, priceOther, allowedUserTypes } =
    updateInfo;

  const product = await Product.findByPk(id, {
    include: [{ model: ProductAllowedUserType, as: "allowedUserTypes" }],
  });
  if (!product) throw new Error("not_found");

  if (courseName) product.courseName = courseName;
  if (priceEgyptian) product.priceEgyptian = priceEgyptian;
  if (priceOther) product.priceOther = priceOther;

  await product.save();

  if (allowedUserTypes) {
    // clear old
    await ProductAllowedUserType.destroy({ where: { productId: id } });
    // insert new (cast to string if using ENUM)
    await ProductAllowedUserType.bulkCreate(
      allowedUserTypes.map((type) => ({
        productId: id,
        userType: String(type),
      }))
    );
  }

  return await Product.findByPk(id, {
    include: [{ model: ProductAllowedUserType, as: "allowedUserTypes" }],
  });
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
