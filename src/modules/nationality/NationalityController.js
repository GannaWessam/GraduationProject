const NationalityService = require("./NationalityService");
const ApiResponse = require("../../Util/ApiResponse");



async function getAllNationalitysController(req, res) {
  const result = await NationalityService.getAllNationalityService(req.query || {});
  return res.status(200).json(ApiResponse.success(result));
}



module.exports = {

    getAllNationalitysController,

};