const { addSupervisor, getAllSupervisors , getSupervisorById ,deleteSupervisor,updateSupervisor} = require("./SupervisorManagmentService.js");
const ApiResponse = require("../../../Util/ApiResponse.js");





exports.register = async (req, res, next) => {
    try {
      const result = await addSupervisor(req.body);
      return res.status(201).json(ApiResponse.created(result));
    } catch (error) {
      return next(error);
    }
  };

  exports.getAll = async (req, res, next) => {
    try {
      const data = await getAllSupervisors();
      res.json(ApiResponse.success(data,"Supervisors fetched successfully"));
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
      const result = await deleteSupervisor(req.params.id);
      return res.json(
        ApiResponse.success(result, "supervisor deleted successfully"));
    } catch (error) {
      return next(error);
    }
  };

  exports.update = async (req, res, next) => {
    try {
      const result = await updateSupervisor(req.params.id, req.body);
  
      return res.json(
        ApiResponse.success(result, "supervisor updated successfully")
      );
    } catch (error) {
      return next(error);
    }
  };