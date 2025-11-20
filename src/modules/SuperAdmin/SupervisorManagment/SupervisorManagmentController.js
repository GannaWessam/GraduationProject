const { addSupervisor, getAllSupervisors,getSupervisorById } = require("./SupervisorManagmentService.js");
const ApiResponse = require("../../../Util/ApiResponse.js");





exports.register = async (req, res, next) => {
    try {
      const result = await addSupervisor(req.body);
      return res.status(201).json(ApiResponse.created(result));
    } catch (err) {
      next(err);
    }
  };

  exports.getAll = async (req, res, next) => {
    try {
      const data = await getAllSupervisors();
      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  exports.getById = async (req, res, next) => {
    try {
      const data = await getSupervisorById(req.params.id);
      res.json(data);
    } catch (err) {
      next(err);
    }
  };