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

// --------------------- REGISTER ADMIN ---------------------
exports.register = async (req, res, next) => {
  try {
    const reqIp =
      req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const reqUser = req.userData; // This should come from your validateToken middleware

    const result = await addAdmin(req.body, reqUser, reqIp);

    // Assign permissions if provided
    if (req.body.permissionList && req.body.permissionList.length > 0) {
      await permissionService.assignPermissionsToUser(
        result.data.user.userId,
        req.body.permissionList
      );
    }

    return res.status(201).json(ApiResponse.created(result));
  } catch (error) {
    return next(error);
  }
};

// --------------------- GET ALL ADMINS ---------------------
exports.getAll = async (req, res, next) => {
  try {
    const reqIp =
      req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const reqUser = req.userData;

    const features = new ApiFeature(req.query)
      .filter()
      .search()
      .sort()
      .pagination()
      .selectedFields();

    const result = await getAllAdmins(features, reqUser, reqIp);
    return res.status(200).json(ApiResponse.success(result));
  } catch (error) {
    return next(error);
  }
};

// --------------------- GET ADMIN BY ID ---------------------
exports.getById = async (req, res, next) => {
  try {
    const reqIp =
      req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const reqUser = req.userData;

    const data = await getAdminById(req.params.id, reqUser, reqIp);
    return res.json(ApiResponse.success(data, "Admin fetched successfully"));
  } catch (error) {
    return next(error);
  }
};

// --------------------- DELETE ADMIN ---------------------
exports.remove = async (req, res, next) => {
  try {
    const reqIp =
      req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const reqUser = req.userData;

    const result = await deleteAdmin(req.params.id, reqUser, reqIp);
    return res.json(ApiResponse.success(result, "Admin deleted successfully"));
  } catch (error) {
    return next(error);
  }
};

// --------------------- UPDATE ADMIN ---------------------
exports.update = async (req, res, next) => {
  try {
    const reqIp =
      req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const reqUser = req.userData;

    const result = await updateAdmin(req.params.id, req.body, reqUser, reqIp);
    return res.json(ApiResponse.success(result, "Admin updated successfully"));
  } catch (error) {
    return next(error);
  }
};