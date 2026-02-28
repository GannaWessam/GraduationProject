const {
  productCourse,
  course,
  Product,
  studentCourse,
  currency,
  L,
} = require("../../models");
const ApiFeature = require("../../Util/ApiFeatures");
const PaginatedResponse = require("../../Util/PaginatedResponse");
const { Op } = require("sequelize");

const Log = require("../../models/Log");

async function getProductCoursesById(id) {
  const res = await Product.findOne({
    where: { productId: id },
    include: [
      {
        model: course,
        attributes: ["name", "courseId"],
        through: { attributes: [] },
      },
    ],
  });
  if (!res || res.length === 0) throw new Error("not_found");
  return res;
}

async function chooseCoursesService(
  userId,
  courses,
  examStatus,
  trainingStatus,
  req,
) {
  try {
    const data = courses.map((courseId) => ({
      userId,
      courseId,
      examStatus,
      trainingStatus,
    }));

    const result = await studentCourse.bulkCreate(data);

    if (req && req.audit) {
      req.audit.affectedUser = {
        _id: userId,
      };
      req.audit.message =
        "Courses selected successfully | تم اختيار الكورسات بنجاح";
    }

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

async function addCourse(courseInfo, req) {
  const { name, title, priceEgyptian, priceOther, currencyId } = courseInfo;

  if (!name || !priceEgyptian || !priceOther || !currencyId || !title)
    throw new Error("missing_required");

  const Currency = await currency.findByPk(currencyId);
  if (!Currency) {
    throw new Error("currency_not_found");
  }

  // 1️⃣ Create course
  const newCourse = await course.create({
    name,
    title,
    priceEgyptian,
    priceOther,
    currencyId,
  });

  // 2️⃣ Get all products
  const allProducts = await Product.findAll({
    attributes: ["productId"],
  });

  // 3️⃣ Prepare bulk insert for productCourse
  const productCoursesData = allProducts.map((product) => ({
    productId: product.productId,
    courseId: newCourse.courseId,
    status: "active", 
  }));

  // 4️⃣ Bulk create relations
  if (productCoursesData.length > 0) {
    await productCourse.bulkCreate(productCoursesData);
  }

  // Audit
  if (req && req.audit) {
    req.audit.affectedThing = {
      _id: newCourse.courseId,
      name: newCourse.name,
    };
    req.audit.message =
      "Course created successfully | تم إنشاء الكورس بنجاح";
  }

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
    "Courses fetched successfully",
  );
}

async function getCourseById(id) {
  const courseData = await course.findByPk(id, {
    include: [
      {
        model: currency,
      },
    ],
  });
  if (!courseData) throw new Error("not_found");
  return courseData;
}

async function updateCourse(id, updateInfo, req) {
  if (!id) throw new Error("missing_course_id");

  const allowedFields = [
    "name",
    "title",
    "priceEgyptian",
    "priceOther",
    "currencyId",
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

  if (req && req.audit) {
    req.audit.affectedThing = {
      _id: courseToUpdate.courseId,
      name: courseToUpdate.name,
    };
    req.audit.message =
      "Course updated successfully | تم تحديث الكورس بنجاح";
  }

  return courseToUpdate;
}

async function deleteCourse(id, req) {
  const coursee = await course.findByPk(id);
  if (!coursee) throw new Error("not_found");

  await coursee.destroy();

  if (req && req.audit) {
    req.audit.affectedThing = {
      _id: id,
      name: coursee.name,
    };
    req.audit.message =
      "Course deleted successfully | تم حذف الكورس بنجاح";
  }

  return { deleted: true };
}

module.exports = {
  getProductCoursesById,
  chooseCoursesService,
  addCourse,
  getAllCoursesService,
  getCourseById,
  updateCourse,
  deleteCourse,
};
