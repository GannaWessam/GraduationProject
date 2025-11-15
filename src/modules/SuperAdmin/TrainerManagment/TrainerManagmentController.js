const { addTrainer } = require("./TrainerManagmentService.js");
const ApiResponse = require("../../../Util/ApiResponse.js");





exports.register = async (req, res, next) => {
    try {
      const result = await addTrainer(req.body);
      return res.status(201).json(ApiResponse.created(result));
    } catch (err) {
      next(err);
    }
  };