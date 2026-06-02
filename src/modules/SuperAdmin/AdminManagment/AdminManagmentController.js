const {
  addAdmin,
  getAllAdmins,
  getAdminById,
  deleteAdmin,
  updateAdmin,
} = require("./AdminManagmentService.js");
const permissionService = require("../../admin/usersManagment/usersServices.js");
const ApiResponse = require("../../../Util/ApiResponse.js");
const ApiFeature = require("../../../Util/ApiFeatures.js");


exports.register = async (req, res, next) => {
  try {
    const result = await addAdmin(req.body, req);

    if (req.body.permissionList?.length > 0) {
      await permissionService.assignPermissionsToUser(
        result.data.user.userId,
        req.body.permissionList,
        req
      );
    }

    return res.status(201).json(ApiResponse.created(result));
  } catch (error) {
    return next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const features = new ApiFeature(req.query)
      .filter()
      .search()
      .sort()
      .pagination()
      .selectedFields();

    const result = await getAllAdmins(features, req);
    return res.status(200).json(ApiResponse.success(result));
  } catch (error) {
    return next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const data = await getAdminById(req.params.id, req);
    return res.json(ApiResponse.success(data, "Admin fetched successfully"));
  } catch (error) {
    return next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const result = await deleteAdmin(req.params.id, req);
    return res.json(ApiResponse.success(result, "Admin deleted successfully"));
  } catch (error) {
    return next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const result = await updateAdmin(req.params.id, req.body, req);
    return res.json(ApiResponse.success(result, "Admin updated successfully"));
  } catch (error) {
    return next(error);
  }
};