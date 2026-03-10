const ApiFeature = require("../../../Util/ApiFeatures");
const ApiResponse = require("../../../Util/ApiResponse");
const getAllRecipts = require("./ReceiptsService");

exports.getAll = async (req, res, next) => {
    try {
      const features = new ApiFeature(req.query)
        .filter()
        .search()
        .sort()
        .pagination()
        .selectedFields();
  
      const result = await getAllRecipts(features);
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };