const trainingService = require("./trainingService");
const ApiFeature = require("../../../Util/ApiFeatures");
const ApiResponse = require("../../../Util/ApiResponse");

// Create a new training (creates both training and event)
const createTraining = async (req, res) => {
  try {
    const result = await trainingService.createTraining(req.body);
    res.status(201).json(ApiResponse.success(result, "Training and event created successfully"));
  } catch (error) {
    if (error.message === "course_not_found") {
      res.status(404).json(ApiResponse.error("Course not found"));
    } else if (error.message === "trainer_not_found") {
      res.status(404).json(ApiResponse.error("Trainer not found"));
    } else {
      res.status(400).json(ApiResponse.error(error.message));
    }
  }
};

// Get training by ID
const getTrainingById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await trainingService.getTrainingById(id);
    res.status(200).json(ApiResponse.success(result));
  } catch (error) {
    if (error.message === "training_not_found") {
      res.status(404).json(ApiResponse.error("Training not found"));
    } else {
      res.status(500).json(ApiResponse.error(error.message));
    }
  }
};

// Get all trainings with filtering, searching, and pagination
const getAllTrainings = async (req, res) => {
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
    if (error.message === "no_trainings_found") {
      res.status(404).json(ApiResponse.error("No trainings found"));
    } else {
      res.status(500).json(ApiResponse.error(error.message));
    }
  }
};


// Update training by ID
const updateTraining = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await trainingService.updateTraining(id, req.body);
    res.status(200).json(ApiResponse.success(result, "Training updated successfully"));
  } catch (error) {
    if (error.message === "training_not_found") {
      res.status(404).json(ApiResponse.error("Training not found"));
    } else if (error.message === "course_not_found") {
      res.status(404).json(ApiResponse.error("Course not found"));
    } else if (error.message === "trainer_not_found") {
      res.status(404).json(ApiResponse.error("Trainer not found"));
    } else {
      res.status(400).json(ApiResponse.error(error.message));
    }
  }
};

const updateEventTraining = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await trainingService.updateTrainingEvent(id, req.body);
    res.status(200).json(ApiResponse.success(result, "Training updated successfully"));
  } catch (error) {
    if (error.message === "training_not_found") {
      res.status(404).json(ApiResponse.error("Training not found"));
    } else if (error.message === "course_not_found") {
      res.status(404).json(ApiResponse.error("Course not found"));
    } else if (error.message === "trainer_not_found") {
      res.status(404).json(ApiResponse.error("Trainer not found"));
    } else {
      res.status(400).json(ApiResponse.error(error.message));
    }
  }
};

// Delete training by ID
const deleteTraining = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await trainingService.deleteTraining(id);
    res.status(200).json(ApiResponse.success(result));
  } catch (error) {
    if (error.message === "training_not_found") {
      res.status(404).json(ApiResponse.error("Training not found"));
    } else {
      res.status(500).json(ApiResponse.error(error.message));
    }
  }
};

// Get training reservations (students connected to training)
const getTrainingReservations = async (req, res) => {
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
    if (error.message === "training_not_found") {
      res.status(404).json(ApiResponse.error("Training not found"));
    } else if (error.message === "no_reservations_found_for_training") {
      res.status(404).json(ApiResponse.error("No reservations found for this training"));
    } else {
      res.status(500).json(ApiResponse.error(error.message));
    }
  }
};

module.exports = {
  createTraining,
  getTrainingById,
  getAllTrainings,
  updateTraining,
  deleteTraining,
  getTrainingReservations,
  updateEventTraining
};
