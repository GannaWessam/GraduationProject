const { Receipts } = require("../../../models");
const PaginatedResponse = require("../../../Util/PaginatedResponse");

async function getAllRecipts(features) {
    const { count, rows } = await Receipts.findAndCountAll({
      ...features.options,
    });
  
    if (!rows || count === 0) throw new Error("not_found");
  
    return PaginatedResponse.fromApiFeature(
      features,
      count,
      rows,
      "Receipts fetched successfully"
    );
  }

  module.exports = getAllRecipts