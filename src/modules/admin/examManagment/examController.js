const examService = require("./examService");
const ApiFeature = require("../../../Util/ApiFeatures");
const ApiResponse = require("../../../Util/ApiResponse");

// Create a new exam (creates both exam and event)
const createExam = async (req, res) => {
  const result = await examService.createExam(req.body);
  res.status(201).json(ApiResponse.success(result, "Exam and event created successfully"));
};

// Get exam by ID
const getExamById = async (req, res) => {
  const { id } = req.params;
  const result = await examService.getExamById(id);
  res.status(200).json(ApiResponse.success(result));
};

// Get all exams with filtering, searching, and pagination
const getAllExams = async (req, res) => {
  const features = new ApiFeature(req.query)
    .filter()
    .search()
    .sort()
    .pagination()
    .selectedFields();
  
  const result = await examService.getAllExams(features);
  res.status(200).json(ApiResponse.success(result));
};

// Get exams by course ID
const getExamsByCourseId = async (req, res) => {
  const { courseId } = req.params;
  const features = new ApiFeature(req.query)
    .filter()
    .search()
    .sort()
    .pagination()
    .selectedFields();
  
  const result = await examService.getExamsByCourseId(courseId, features);
  res.status(200).json(ApiResponse.success(result));
};

// Get exams by supervisor ID
const getExamsBySupervisorId = async (req, res) => {
  const { supervisorId } = req.params;
  const features = new ApiFeature(req.query)
    .filter()
    .search()
    .sort()
    .pagination()
    .selectedFields();
  
  const result = await examService.getExamsBySupervisorId(supervisorId, features);
  res.status(200).json(ApiResponse.success(result));
};

// Update exam by ID
const updateExam = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  
  const result = await examService.updateExam(id, updateData);
  res.status(200).json(ApiResponse.success(result, "Exam and linked event updated successfully"));
};

// Delete exam by ID
const deleteExam = async (req, res) => {
  const { id } = req.params;
  const result = await examService.deleteExam(id);
  res.status(200).json(ApiResponse.success(result));
};

// Get exam reservations (users connected to exam)
const getExamReservations = async (req, res) => {
  const { id } = req.params;
  const features = new ApiFeature(req.query)
    .filter()
    .search()
    .sort()
    .pagination()
    .selectedFields();
  
  const result = await examService.getExamReservations(id, features);
  res.status(200).json(ApiResponse.success(result));
};

// Get upcoming exams
const getUpcomingExams = async (req, res) => {
  const features = new ApiFeature(req.query)
    .filter()
    .search()
    .sort()
    .pagination()
    .selectedFields();
  
  const result = await examService.getUpcomingExams(features);
  res.status(200).json(ApiResponse.success(result));
};

module.exports = {
  createExam,
  getExamById,
  getAllExams,
  getExamsByCourseId,
  getExamsBySupervisorId,
  updateExam,
  deleteExam,
  getUpcomingExams,
  getExamReservations
};
