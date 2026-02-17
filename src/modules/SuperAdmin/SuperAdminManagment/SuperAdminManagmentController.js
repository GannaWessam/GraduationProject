const { addSuperAdmin, getAllSuperAdmins , getSuperAdminById, updateSuperAdmin } = require("./SuperAdminManagmentService.js");
const ApiResponse = require("../../../Util/ApiResponse.js");





exports.register = async (req, res, next) => {
    try {
      const result = await addSuperAdmin(req.body,req);
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

  exports.update = async (req, res, next) => {
    try {
      const result = await updateSuperAdmin(req.params.id, req.body,req);
  
      return res.json(
        ApiResponse.success(result, "superadmin updated successfully")
      );
    } catch (error) {
      return next(error);
    }
  };