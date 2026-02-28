const {systemdata} = require("../../../models");
const PaginatedResponse = require("../../../Util/PaginatedResponse"); 


const getAllSystemData = async (features = {}) => {
  const page = features.page * 1 || 1;
  const limit = features.limit * 1 || 10;
  const offset = (page - 1) * limit;

  const queryOptions = {
    limit,
    offset,
    where: features.options?.where || {},
  };

  const { count, rows } = await systemdata.findAndCountAll(queryOptions);

  return PaginatedResponse.fromApiFeature(features, count, rows, "System data fetched successfully");
};


const updateSystemDataById = async (systemDataId, updateInfo) => {
    const systemData = await systemdata.findByPk(systemDataId);
    if (!systemData) {
      throw new Error("system_data_not_found");
    }
  
    await systemData.update(updateInfo);
    return systemData;
  };
  
module.exports = {
  getAllSystemData,
  updateSystemDataById,
};