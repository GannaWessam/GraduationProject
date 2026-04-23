const trainingService = require("./trainingService");
const ApiFeature = require("../../../Util/ApiFeatures");
const ApiResponse = require("../../../Util/ApiResponse");

// Create a new training (creates both training and event)
const createTraining = async (req, res,next) => {
  try {
    const result = await trainingService.createTraining(req.body);
    res.status(201).json(ApiResponse.success(result, "Training and event created successfully"));
  } catch (error) {
    return next(error);
  }
};

// Get training by ID
const getTrainingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await trainingService.getTrainingById(id);
    res.status(200).json(ApiResponse.success(result));
  } catch (error) {
    return next(error);
  }
};

// Get all trainings with filtering, searching, and pagination
const getAllTrainings = async (req, res, next) => {
  try {
    const features = new ApiFeature(req.query)
      .filter()
      .search()
      .sort()
      .pagination()
      .selectedFields();
    
    const result = await trainingService.getAllTrainings(features);
    res.status(200).json(ApiResponse.success(result));
  } catch (error) {
    return next(error);
  }
};
const getAllTrainingsForTrainer = async (req, res, next) => {
  try {
    const features = new ApiFeature(req.query)
      .filter()
      .search()
      .sort()
      .pagination()
      .selectedFields();
      const { id } = req.params;
    const result = await trainingService.getTrainingsForTrainer(id,features);
    res.status(200).json(ApiResponse.success(result));
  } catch (error) {
    return next(error);
  }
};


// Update training by ID
const updateTraining = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await trainingService.updateTraining(id, req.body);
    res.status(200).json(ApiResponse.success(result, "Training updated successfully"));
  } catch (error) {
    return next(error);
  }
};

const updateEventTraining = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await trainingService.updateTrainingEvent(id, req.body);
    res.status(200).json(ApiResponse.success(result, "Training updated successfully"));
  } catch (error) {
    return next(error);
  }
};

// Delete training by ID
const deleteTraining = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await trainingService.deleteTraining(id);
    res.status(200).json(ApiResponse.success(result));
  } catch (error) {
    return next(error);
  }
};

// Get training reservations (students connected to training)
const getTrainingReservations = async (req, res, next) => {
  try {
    const { id } = req.params;
    const features = new ApiFeature(req.query)
      .filter()
      .search()
      .sort()
      .pagination()
      .selectedFields();
    
    const result = await trainingService.getTrainingReservations(id, features);
    res.status(200).json(ApiResponse.success(result));
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createTraining,
  getTrainingById,
  getAllTrainings,
  updateTraining,
  deleteTraining,
  getTrainingReservations,
  updateEventTraining,
  getAllTrainingsForTrainer
};
