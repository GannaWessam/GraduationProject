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
  const { name , title , priceEgyptian , priceOther , currency} = courseInfo;
  if (!name || !priceEgyptian || !priceOther || !currency || !title) throw new Error("missing_required");
  const newCourse = await course.create({ 
    name ,
    title,
    priceEgyptian,
    priceOther,
    currency});
  return newCourse;
}

async function getAllCoursesService(features) {
  
  const { count, rows: courses } = await course.findAndCountAll({
    ...features.options, 
  });

  if (!courses) throw new Error("not_found");

  return PaginatedResponse.fromApiFeature(
    features,
    count,
    courses,
    "Courses fetched successfully"
  );
}


async function getCourseById(id) {
  const courseData = await course.findByPk(id);
  if (!courseData) throw new Error("not_found");
  return courseData;
}

async function updateCourse(id, updateInfo) {
    if (!id) throw new Error("missing_course_id");
  
    const allowedFields = [
      "name",
      "title",
      "priceEgyptian",
      "priceOther",
      "currency",
    ];
  
    const updateData = {};
    for (const key of allowedFields) {
      if (updateInfo[key] !== undefined) {
        updateData[key] = updateInfo[key];
      }
    }
  
    if (Object.keys(updateData).length === 0)
      throw new Error("no_data_to_update");
  
    const courseToUpdate = await course.findByPk(id);
    if (!courseToUpdate) throw new Error("course_not_found");
  
    await courseToUpdate.update(updateData);
    return courseToUpdate;
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