const examService = require("./examService");
const ApiFeature = require("../../../Util/ApiFeatures");
const ApiResponse = require("../../../Util/ApiResponse");

// Create a new exam (creates both exam and event)
const createExam = async (req, res) => {
  // const examData = req.body.examData;
  // const packageId = req.body.packageId;
  const result = await examService.createExam(req.body,req);
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


const updateExam = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  
  const result = await examService.updateExam(id, updateData,req);
  res.status(200).json(ApiResponse.success(result, "Exam and linked event updated successfully"));
};

const deleteExam = async (req, res) => {
  const { id } = req.params;
  const result = await examService.deleteExam(id,req);
  res.status(200).json(ApiResponse.success(result));
};

// Get exam reservations (students connected to exam)
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

const ReexamController = async (req, res) => {
try {
  const userId = req.userData.id;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User Id is required' });
    }

    const newExam = await examService.ReexamService(userId,req.params.courseId,req);

    res.status(201).json({
      success: true,
      data: newExam
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error creating efada record'
    });
  }};

module.exports = {
  createExam,
  getExamById,
  getAllExams,
  updateExam,
  deleteExam,
  getUpcomingExams,
  getExamReservations,
  ReexamController
};
