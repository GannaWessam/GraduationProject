const sequelize = require('../connections/db');
const { Product } = require('../models');

// 🟢 Register
async function addProduct (ProductInfo) {
    const { Service , price , Category } = ProductInfo; 

    if (!Service || !price || !Category ) {
        throw new Error('missing_required_fields');
    }

    const ProductaInfo = await Product.create({product : Service , price : price , Category : Category})

    return{
        ProductInfo
    }

}

module.exports = { addProduct };