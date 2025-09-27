const { Product } = require("../../models");

async function addProduct(ProductInfo) {
  const { Service, price, Category, type } = ProductInfo;

  if (!Service || !price || !Category || !type) {
    throw new Error("missing_required");
  }

  const newProduct = await Product.create({
    product: Service,
    price,
    Category,
    user: type,
  });

  return newProduct;
}

async function getProductByType({ type }) {
  if (!type) {
    throw new Error("missing_required");
  }

  const services = await Product.findAll({
    where: { user: type },
  });

  if (!services || services.length === 0) {
    throw new Error("not_found_service");
  }

  return services;
}

module.exports = { addProduct, getProductByType };
