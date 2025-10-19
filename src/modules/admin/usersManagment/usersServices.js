const { Error } = require("sequelize");
const { User, Student, sequelize ,Payment ,Product } = require("../../../models");
const ApiFeature = require("../../../Util/ApiFeatures");
const PaginatedResponse = require("../../../Util/PaginatedResponse");
const WebSocket = require('../../../Services/WebSocket')

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
const { sendNotificationToUser } = require("../../../Services/pushService");

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

// const getAllUsersByStatus = async (status, features) => {
//   const where = {...features.options.where};
//   if (status) where.status = status;

//   const { count, rows: students } = await Student.findAndCountAll({
//     ...features.options,
//     where,
//     include: [
//       {
//         model: User,
//         attributes: ["email"],include: [
//           {
//             model: Payment,
//             attributes: ["amount", "status", "timestamp"],
//             include: [
//               {
//                 model: Product,
//                 attributes: ["courseName"], 
//               },
//             ],
//           },
//         ],
        
//       },
//     ],
//   });

//   if (!students || students.length === 0) throw new Error("not_found");

//   return PaginatedResponse.fromApiFeature(
//     features,
//     count,
//     students,
//     "Users fetched successfully"
//   );
// };

const getAllUsersByStatus = async (status, features) => {
  const where = { ...(features.options?.where || {}) };
  if (status) where.status = status;

  const { count, rows: students } = await Student.findAndCountAll({
    ...features.options,
    where,
    include: [
      {
        model: User,
        attributes: ["email"],
        include: [
          {
            model: Payment,
            as: "payments", // ✅ alias مطابق للعلاقة
            attributes: ["amount", "status", "timestamp"],
            include: [
              {
                model: Product,
                as: "product", // ✅ alias مطابق للعلاقة
                attributes: ["courseName"],
              },
            ],
          },
        ],
      },
    ],
  });

  if (!students?.length) throw new Error("not_found");

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

const approveStudentByUserId = async (userId) => { //ysma3 fe profile el user ||  ysma3 m3 elnas elly msgla real time
  const student = await Student.findOne({ where: { userId } });
  if (!student) throw new Error("student_not_found");

  student.status = "approved";
  await student.save();
  
  WebSocket.notifyClients(student, "approvedStudent");

  
  const payload={
    title:"Acceptance Message",
    body:"Your data has been modified and now you can regiester your course or exam"
  }
  await sendNotificationToUser(userId,payload)

  return { message: "Student approved successfully", student };
};


const getAllUserss = async () => {
  try {
    const users = await User.findAll({
      attributes: ["userId", "email", "role"], // select only relevant fields
      order: [["createdAt", "DESC"]],
    });
    return users;
  } catch (error) {
    throw new Error("Failed to fetch users: " + error.message);
  }
};



async function updateStudentNationalId(userId, nationalId) {
  if (!nationalId) throw new Error("nationalId_required");

 
  // validateNationalId(nationalId);

  return sequelize.transaction(async (t) => {
    const student = await Student.findOne({ where: { userId }, transaction: t });
    if (!student) throw new Error("student_not_found");

    const updateData = { nationalId };
   

 
    const { updated, model: updatedStudent } = await updateIfChanged(student, updateData, t);

    return {
      updated,
      student: updatedStudent,
      message: "National ID updated successfully",
    };
  });
}





module.exports = {
  getAllUsers,
  getAllUsersByStatus,
  deleteUserById,
  getuUserById,
  updateUser,
  addAdmin,
  approveStudentByUserId,
  getAllUserss,
  updateStudentNationalId
};
