const { addSupervisor, getAllSupervisors , getSupervisorById ,deleteSupervisor,updateSupervisor} = require("./SupervisorManagmentService.js");
const ApiResponse = require("../../../Util/ApiResponse.js");
const ApiFeature = require("../../../Util/ApiFeatures.js");
const permissionService = require("../../admin/usersManagment/usersServices.js")





exports.register = async (req, res, next) => {
    try {
      const result = await addSupervisor(req.body,req);
      const per = await permissionService.assignPermissionsToUser(result.data.user.userId,req.body.permissionList);
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

  const result = await getAllSupervisors(features);
  res.status(200).json(ApiResponse.success(result));

    } catch (error) {
      return next(error);
    }
  };

  exports.getById = async (req, res, next) => {
    try {
      const data = await getSupervisorById(req.params.id);
      res.json(ApiResponse.success(data,"Supervisor fetched successfully"));
    } catch (error) {
      return next(error);
    }
  };


  exports.remove = async (req, res, next) => {
    try {
      const result = await deleteSupervisor(req.params.id,req);
      return res.json(
        ApiResponse.success(result, "supervisor deleted successfully"));
    } catch (error) {
      return next(error);
    }
  };

  exports.update = async (req, res, next) => {
    try {
      const result = await updateSupervisor(req.params.id, req.body,req);
  
      return res.json(
        ApiResponse.success(result, "supervisor updated successfully")
      );
    } catch (error) {
      return next(error);
    }
  };