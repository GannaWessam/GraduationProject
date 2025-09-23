const sequelize = require('../connections/db');
const { Product } = require('../models');

// 🟢 Register
async function addProduct (ProductInfo) {
    const { Service , price , Category , type} = ProductInfo; 

    if (!Service || !price || !Category || !type ) {
        throw new Error('missing_required_fields');
    }

    const ProductaInfo = await Product.create({product : Service , price : price , Category : Category ,user : type })

    return{
        ProductInfo
    }

}
async function getProductByType (ProductInfo) {
    const {type} = ProductInfo ;
    if ( !type ) {
        throw new Error('missing_required_fields');
    }
    const service = await Product.findAll({
        where: { user: type }
        });

        if ( !service ) {
            throw new Error('not found service');
        }

        return {
            service
        }

}

module.exports = { addProduct , getProductByType};