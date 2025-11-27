const { addAdmin, getAllAdmins,getAdminById } = require("./AdminManagmentService.js");
const ApiResponse = require("../../../Util/ApiResponse.js");





exports.register = async (req, res, next) => {
    try {
      const result = await addAdmin(req.body);
      return res.status(201).json(ApiResponse.created(result));
    } catch (error) {
      return next(error);
    }
  };

  exports.getAll = async (req, res, next) => {
    try {
      const data = await getAllAdmins();
      res.json(ApiResponse.success(data,"Admins fetched successfully"));
    } catch (error) {
      return next(error);
    }
  };

  exports.getById = async (req, res, next) => {
    try {
      const data = await getAdminById(req.params.id);
      res.json(ApiResponse.success(data,"Admin fetched successfully"));
    } catch (error) {
      return next(error);
    }
  };