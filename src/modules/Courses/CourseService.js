const { productCourse , course , Product ,studentCourse} = require("../../models");
const ApiFeature = require("../../Util/ApiFeatures");
const PaginatedResponse = require("../../Util/PaginatedResponse");
const { Op } = require("sequelize");



async function getProductCoursesById(id) {
    const res = await Product.findOne({
        where: { productId:id },
        include: [
        {
            model: course,
            attributes: ["name" , "courseId"],
            through: { attributes: [] } 
        },
        ],
    });

    if (!res || res.length === 0) throw new Error("not_found");
    return res;
}

async function chooseCoursesService(userId,courses ,examStatus,  trainingStatus) {
    try {
    const data = courses.map((courseId) => ({
        userId,
        courseId,
        examStatus,
        trainingStatus,
    }));

    const result = await studentCourse.bulkCreate(data);

    return {
        status: "success",
        message: "Courses inserted successfully",
        data: result,
    };
    } catch (error) {
    console.error(error);
    throw new Error(error.message || "Failed to insert courses");
    }
}




async function addCourse(courseInfo) {
  const { name } = courseInfo;
  if (!name) throw new Error("missing_required");

  const newCourse = await course.create({ name });
  return newCourse;
}

async function getAllCoursesService(query = {}) {
  const courses = await course.findAll({
    where: query.name
      ? { name: { [Op.iLike]: `%${query.name}%` } }
      : undefined,
    order: [["createdAt", "DESC"]],
  });
  return courses;
}

async function getCourseById(id) {
  const course = await course.findByPk(id);
  if (!course) throw new Error("not_found");
  return course;
}

async function updateCourse(id, updateInfo) {
  const coursee = await course.findByPk(id);
  if (!coursee) throw new Error("not_found");

  if (updateInfo.name) coursee.name = updateInfo.name;

  await coursee.save();
  return coursee;
}

async function deleteCourse(id) {
  const coursee = await course.findByPk(id);
  if (!coursee) throw new Error("not_found");

  await coursee.destroy();
  return { deleted: true };
}



module.exports = {
 getProductCoursesById,
 chooseCoursesService,
  addCourse,
  getAllCoursesService,
  getCourseById,
  updateCourse,
  deleteCourse,};