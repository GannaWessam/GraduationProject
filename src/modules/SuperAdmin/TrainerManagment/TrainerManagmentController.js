const { addTrainer, getAllTrainers,getTrainerById } = require("./TrainerManagmentService.js");
const ApiResponse = require("../../../Util/ApiResponse.js");





exports.register = async (req, res, next) => {
    try {
      const result = await addTrainer(req.body);
      return res.status(201).json(ApiResponse.created(result));
    } catch (error) {
      return next(error);
    }
  };

  exports.getAll = async (req, res, next) => {
    try {
      const data = await getAllTrainers();
      res.json(data);
    } catch (error) {
      return next(error);
    }
  };

  exports.getById = async (req, res, next) => {
    try {
      const data = await getTrainerById(req.params.id);
      res.json(data);
    } catch (error) {
      return next(error);
    }
  };