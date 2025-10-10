const { Error } = require("sequelize");
const { User, Student, sequelize } = require("../../../models");
const ApiFeature = require("../../../Util/ApiFeatures");
const PaginatedResponse = require("../../../Util/PaginatedResponse");
const {
  updateIfChanged,
  preparePassword,
  prepareQr,
  buildStudentUpdateData,
  buildUserUpdateData,
} = require("./helpers/updateHelper");

const {
  generateQr,
  checkEmailExists,
} = require("../../Auth/helpers/userHelper");
const { hashPassword } = require("../../Auth/helpers/passwordHelper");
const {
  validateName,
  validatePassword,
  validateNationalId,
} = require("../../Auth/validations/registerValidation");
const {
  formatStudentResponse,
  createStudentSuccessResponse,
} = require("./helpers/responseHelper");

///   Update status only method
//msh h3ml create h3ml endpoint gdeda ala el register bs mbd'yan

const addAdmin = async (info) => {
  const { email, password } = info;

  return sequelize.transaction(async (t) => {
    await checkEmailExists(email, t);

    const hashedPassword = await hashPassword(password);

    const user = await User.create(
      { email, passwordHash: hashedPassword, role: "ADMIN" },
      { transaction: t }
    );

    return user;
  });
};

const getuUserById = async (id) => {
  const user = await User.findByPk(id);
  if (!user) throw new Error("id_not_found");

  const student = await Student.findOne({ where: { userId: id } });
  if (!student) throw new Error("student_not_found");

  return formatStudentResponse(student, user);
};

const getAllUsers = async (features) => {
  // const users = await User.findAll(features.options);
  const { count, rows: students } = await Student.findAndCountAll({
    ...features.options,
    include: [{
      model: User,
    }]
  });
  if (!students) throw new Error("not_found");

  return PaginatedResponse.fromApiFeature(
    features,
    count,
    students,
    "Users fetched successfully"
  );
};

const getAllUsersByStatus = async (status, features) => {
  const where = {...features.options.where};
  if (status) where.status = status;

  const { count, rows: students } = await Student.findAndCountAll({
    ...features.options,
    where,
    include: [
      {
        model: User,
        attributes: ["email"],
      },
    ],
  });

  if (!students || students.length === 0) throw new Error("not_found");

  return PaginatedResponse.fromApiFeature(
    features,
    count,
    students,
    "Users fetched successfully"
  );
};

const deleteUserById = async (id) => {
  const deletedCount = await User.destroy({ where: { userId: id } });
  if (deletedCount) return deletedCount;
  else throw new Error("id_not_found");
};

async function updateUser(userId, payload, idImage) {
  if (payload.name_ar) validateName(payload.name_ar);

  const [hashedPassword, qr] = await Promise.all([
    preparePassword(payload.password),
    prepareQr(payload.name_ar, payload.national_id),
  ]);

  return sequelize.transaction(async (t) => {
    const [user, student] = await Promise.all([
      User.findByPk(userId, { transaction: t }),
      Student.findOne({ where: { userId }, transaction: t }),
    ]);

    if (!user) throw new Error("user_not_found");
    if (!student) throw new Error("student_not_found");

    const { updated: userUpdated, model: updatedUser } = await updateIfChanged(
      user,
      buildUserUpdateData({
        email: payload.email,
        hashedPassword,
        role: payload.role,
      }),
      t
    );

    const { updated: studentUpdated, model: updatedStudent } =
      await updateIfChanged(
        student,
        buildStudentUpdateData(payload, idImage, qr),
        t
      );

    return createStudentSuccessResponse(
      updatedStudent,
      updatedUser,
      "User updated successfully"
    );
  });
}

const approveStudentByUserId = async (userId) => {
  const student = await Student.findOne({ where: { userId } });
  if (!student) throw new Error("student_not_found");

  student.status = "approved";
  await student.save();

  return { message: "Student approved successfully", student };
};


module.exports = {
  getAllUsers,
  getAllUsersByStatus,
  deleteUserById,
  getuUserById,
  updateUser,
  addAdmin,
  approveStudentByUserId,
};
