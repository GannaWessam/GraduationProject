const { addAdmin, getAllAdmins,getAdminById , deleteAdmin , updateAdmin} = require("./AdminManagmentService.js");
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

  exports.remove = async (req, res, next) => {
    try {
      const result = await deleteAdmin(req.params.id);
      return res.json(ApiResponse.success(result, "Admin deleted successfully"));
    } catch (error) {
      return next(error);
    }
  };

  exports.update = async (req, res, next) => {
    try {
      const result = await updateAdmin(req.params.id, req.body);
  
      return res.json(
        ApiResponse.success(result, "Admin updated successfully")
      );
    } catch (error) {
      return next(error);
    }
  };