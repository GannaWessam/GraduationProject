const CourseService = require("./CourseService");
const ApiResponse = require("../../Util/ApiResponse");
const { Student , Product } = require("../../models");
const { where } = require("sequelize");



async function addCourse(req, res) {
  const result = await CourseService.addCourse(req.body);
  return res.status(201).json(ApiResponse.created(result));
}

async function getAllCoursesController(req, res, next) {
  try {
    const result = await CourseService.getAllCoursesService(req.query || {});
    return res.status(200).json(ApiResponse.success(result));
  } catch (error) {
    return next(error);
  }
}

async function getCourseById(req, res) {
  const result = await CourseService.getCourseById(req.params.id);
  return res.status(200).json(ApiResponse.success(result));
}

async function updateCourse(req, res) {
  const result = await CourseService.updateCourse(req.params.id, req.body);
  return res.status(200).json(ApiResponse.success(result));
}

async function deleteCourse(req, res) {
  const result = await CourseService.deleteCourse(req.params.id);
  return res.status(200).json(ApiResponse.success(result));
}


async function getProductCoursesByIdController(req, res) {
    const id = req.userData.id;

    
    const StudentData = await Student.findOne({where:{userId:id}});
console.log(StudentData);

    const result = await CourseService.getProductCoursesById(StudentData.productId);
    return res.status(200).json(ApiResponse.success(result));
}

async function chooseCoursesController(req, res) {
    let examStatus,trainingStatus;
    const id = req.userData.id;
    const StudentData = await Student.findOne({where:{userId:id}});
    const productData = await Product.findOne({where:{productId:StudentData.productId}});

    if(productData.examStatus === true){
        examStatus = "waiting"
    }else{
        examStatus = null
    }
    if(productData.trainingStatus === true){
        trainingStatus = "waiting"
    }else{
        trainingStatus = null
    }

    const result = await CourseService.chooseCoursesService(StudentData.userId , req.body.courses, examStatus,trainingStatus);
    return res.status(200).json(ApiResponse.success(result));
}

module.exports = {
    getProductCoursesByIdController,
    chooseCoursesController,
      addCourse,
  getAllCoursesController,
  getCourseById,
  updateCourse,
  deleteCourse,
};