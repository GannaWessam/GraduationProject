const { addSuperAdmin, getAllSuperAdmins , getSuperAdminById } = require("./SuperAdminManagmentService.js");
const ApiResponse = require("../../../Util/ApiResponse.js");





exports.register = async (req, res, next) => {
    try {
      const result = await addSuperAdmin(req.body);
      return res.status(201).json(ApiResponse.created(result));
    } catch (error) {
      return next(error);
    }
  };

  exports.getAll = async (req, res, next) => {
    try {
      const data = await getAllSuperAdmins();
      res.json(ApiResponse.success(data,"SuperAdmins fetched successfully"));
    } catch (error) {
      return next(error);
    }
  };

  exports.getById = async (req, res, next) => {
    try {
      const data = await getSuperAdminById(req.params.id);
      res.json(ApiResponse.success(data,"SuperAdmin fetched successfully"));
    } catch (error) {
      return next(error);
    }
  };