const { addTrainer, getAllTrainers , getTrainerById , deleteTrainer ,updateTrainer} = require("./TrainerManagmentService.js");
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
      res.json(ApiResponse.success(data,"Trainers fetched sucessfully"));
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

  exports.remove = async (req, res, next) => {
    try {
      const result = await deleteTrainer(req.params.id);
      return res.json(
        ApiResponse.success(result, "Trainer deleted successfully"));
    } catch (error) {
      return next(error);
    }
  };

  exports.update = async (req, res, next) => {
    try {
      const result = await updateTrainer(req.params.id, req.body);
  
      return res.json(
        ApiResponse.success(result, "Trainer updated successfully")
      );
    } catch (error) {
      return next(error);
    }
  };