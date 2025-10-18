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
module.exports = {
 getProductCoursesById,
 chooseCoursesService
};