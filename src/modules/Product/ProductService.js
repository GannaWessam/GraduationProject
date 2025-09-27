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

async function getProductByType(type , nationality ) {

  var cate = "egyptian" ;

  if(nationality !== "Egypt"){
      cate = "other";
  }

  if (!type || !nationality) {
    throw new Error("missing_required");
  }

  const services = await Product.findAll({
    where: { user: type  , Category : cate},
  });

  if (!services || services.length === 0) {
    throw new Error("not_found_service");
  }

  return services;
}

module.exports = { addProduct, getProductByType };
