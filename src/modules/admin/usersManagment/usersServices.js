const { Error } = require("sequelize");
// const { User, Student, sequelize ,Payment ,Product } = require("../../../models");
const {
  Student,
  User,
  Payment,
  Product,
  Permission,
  studentCourse,
  course,
  examReservation,
  exam,
  trainingReservation,
  training,
  reservation,
  event,
  sequelize,
  package,
  packageCourse,
  trainer,
  supervisor
} = require("../../../models");
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
//--------------------------------------------------------------------
// const getAllUsersByStatus = async (status, features) => {
//   const where = { ...(features.options?.where || {}) };
//   if (status) where.status = status;

//   const { count, rows: students } = await Student.findAndCountAll({
//     ...features.options,
//     where,
//     include: [
//       {
//         model: User,
//         attributes: ["email"],
//         include: [
//           {
//             model: Payment,
//             as: "payments", // ✅ alias مطابق للعلاقة
//             attributes: ["amount", "status", "timestamp"],
//             include: [
//               {
//                 model: Product,
//                 as: "product", // ✅ alias مطابق للعلاقة
//                 attributes: ["courseName"],
//               },
//             ],
//           },
//         ],
//       },
//     ],
//   });

//   if (!students?.length) throw new Error("not_found");

//   return PaginatedResponse.fromApiFeature(
//     features,
//     count,
//     students,
//     "Users fetched successfully"
//   );
// };
//----------------------------------------------------------------------
const { Op } = require("sequelize");

const getAllUsersByStatus = async (status, features) => {
  const where = { ...(features.options?.where || {}) };

  if (status) {
    if (status.startsWith("!")) {

      const realStatus = status.substring(1); 
      where.status = { [Op.ne]: realStatus };
    } else {

      where.status = status;
    }
  }

  const { count, rows: students } = await Student.findAndCountAll({
    ...features.options,
    where,
    distinct: true,
    include: [
      {
        model: User,
        attributes: ["email"],
        include: [
          {
            model: Payment,
            attributes: ["amount", "status", "timestamp"],
            include: [
              {
                model: Product,
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

async function updateUser(userId, payload, idImage,req) {
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

      const message={
        title:"Update personal data",
        body:"Your data has been modified plase go to your profile to check it",
        redirectUrl:"profile"
      }
      const translation={
        title: "تحديث البيانات الشخصية",
        body: "تم تعديل بياناتك، يرجى الذهاب إلى ملفك الشخصي للتحقق منها",
        type:"Edit"
      }
      WebSocket.notifyClients("message",userId)
      sendNotificationToUser(userId, message, translation)
      .catch(err => console.error("Push error:", err));

      if (req && req.audit) {
        req.audit.affectedThing = { name: payload.name_ar };
        req.audit.user = { _id: req.userData.id, name: req.userData.name, email: req.userData.email };
        req.audit.message =
          "User updated successfully | تم تحديث المستخدم بنجاح";
      }
      

    return createStudentSuccessResponse(
      updatedStudent,
      updatedUser,
      "User updated successfully"
    );
  });
}

const approveStudentByUserId = async (userId,req) => { //ysma3 fe profile el user ||  ysma3 m3 elnas elly msgla real time
  const student = await Student.findOne({ where: { userId } });
  if (!student) throw new Error("student_not_found");

  student.status = "approved";
  await student.save();
  
  WebSocket.notifyClients(student, "approvedStudent");

  
  const payload={
    title:"Acceptance Message",
    body:"Your data has been modified and now you can regiester your course or exam",
    redirectUrl:"profile"
  }
  const translation={
    title: "رسالة القبول",
    body: "تم قبول بياناتك، ويمكنك الآن تسجيل دورتك أو امتحانك",
    type:"Accept"
  }
   WebSocket.notifyClients("message",userId)
      sendNotificationToUser(userId, payload, translation)
      .catch(err => console.error("Push error:", err));

      if (req && req.audit) {
        req.audit.affectedThing = { name: student.fullName };
        req.audit.user = { _id: req.userData.id, name: req.userData.name, email: req.userData.email };
        req.audit.message =
          "User Approved successfully | تم قبول المستخدم بنجاح";
      }
      

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
    throw new Error("failed_to_fetch_users");
  }
};



async function updateStudentNationalId(userId, nationalId,req) {
  if (!nationalId) throw new Error("nationalId_required");

 
  // validateNationalId(nationalId);

  return sequelize.transaction(async (t) => {
    const student = await Student.findOne({ where: { userId }, transaction: t });
    if (!student) throw new Error("student_not_found");

    const updateData = { nationalId };
   

 
    const { updated, model: updatedStudent } = await updateIfChanged(student, updateData, t);
    
    const payload={
      title:"Update national ID",
      body:"Your national id has been modified plase go to your profile to check it",
      redirectUrl:"profile"
    }
    const translation={
      title: "تحديث رقم الهوية",
      body: "تم تعديل رقم الهوية الوطنية الخاص بك، يرجى الذهاب إلى ملفك الشخصي للتحقق منه",      
      type:"Edit"
    }
    sendNotificationToUser(userId, payload, translation)
    .catch(err => console.error("Push error:", err));
    
    WebSocket.notifyClients("message",userId)
    if (req && req.audit) {
      req.audit.affectedThing = { name: student.fullName };
      req.audit.user = { _id: req.userData.id, name: req.userData.name, email: req.userData.email };
      req.audit.message =
        "User updated successfully | تم تحديث المستخدم بنجاح";
    }
    
    return {
      updated,
      student: updatedStudent,
      message: "National ID updated successfully",
    };
  });
}




 // adjust path to your models folder

 const getStudentById = async (userId) => {
  const student = await Student.findOne({
    where: { userId },
    include: [
      {
        model : Product,
        attributes:["courseName"]
      }
    ],
  });

  if (!student) throw new Error("student_not_found");

  return student;
};


const getUsersByTrainingId = async (trainingId, features) => {
  try {
    const {
      where: featureWhere,
      limit,
      offset,
      order,
      attributes,
    } = features.options || {};
    const { count, rows } = await trainingReservation.findAndCountAll({
      where: {
        trainingId,
        ...(featureWhere || {}),
      },
      distinct: true,
      limit,
      offset,
      order,
      attributes,
      attributes: ["trainingReservationId", "reservationStatus"],
      include: [
        {
          model: Student,
          attributes: ["fullName","Mobile","NameEn","college","nationalId","university"],
          include: [
            {
              model: User,
              attributes: ["email"],
            },
          ],
        },
      ],
    });

    const mappedRows = rows.map((r) => ({
      trainingReservationId: r.trainingReservationId,
      fullName: r.Student.fullName,
      email: r.Student.User.email,
      NameEn:r.Student.NameEn,
      Mobile:r.Student.Mobile,
      college:r.Student.college,
      nationalId:r.Student.nationalId,
      university:r.Student.university,
      reservationStatus: r.reservationStatus,
    }));

    return PaginatedResponse.fromApiFeature(
      features,
      count,
      mappedRows,
      "Students fetched successfully"
    );
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch students for this training");
  }
};

const getUsersByExamId = async (examId, features) => {
  try {
    const {
      where: featureWhere,
      limit,
      offset,
      order,
      attributes,
    } = features.options || {};
    const { count, rows } = await examReservation.findAndCountAll({
      where: {
        examId,
        ...(featureWhere || {}),
      },
      distinct: true,
      limit,
      offset,
      order,
      attributes,
      attributes: ["examReservationId","reservationStatus"],
      include: [
        {
          model: Student,
          attributes: ["fullName","NameEn","Mobile","college"],
          include: [
            {
              model: User,
              attributes: ["email"],
            },
          ],
        },
      ],
    });

    const mappedRows = rows.map((r) => ({
      examReservationId: r.examReservationId,
      fullName: r.Student.fullName,
      NameEn:r.Student.NameEn,
      Mobile:r.Student.Mobile,
      college:r.Student.college,
      email: r.Student.User.email,
      reservationStatus: r.reservationStatus,
    }));

    return PaginatedResponse.fromApiFeature(
      features,
      count,
      mappedRows,
      "Students fetched successfully"
    );
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch students for this exam");
  }
};

const assignPermissionsToUser = async (userId, permissionNames = [],req) => {
  if (!Array.isArray(permissionNames) || permissionNames.length === 0) {
    throw new Error("permissions_array_required");
  }

  return sequelize.transaction(async (t) => {
    const user = await User.findByPk(userId, { transaction: t });
    if (!user) throw new Error("user_not_found");

    // Normalize permission names
    const normalizedNames = permissionNames.map(p =>
      p.trim().toUpperCase()
    );

    // Fetch permissions
    const permissions = await Permission.findAll({
      where: { name: normalizedNames },
      transaction: t,
    });

    if (permissions.length !== normalizedNames.length) {
      throw new Error("one_or_more_permissions_not_found");
    }

    // Assign (this auto-handles duplicates)
    await user.setPermissions(permissions, { transaction: t });
    await User.increment("tokenVersion", { where: { userId: userId } });
    if (req && req.audit) {
      req.audit.affectedThing = { email: user.email };
      req.audit.user = { _id: req.userData.id, name: req.userData.name, email: req.userData.email };
      req.audit.message =
        "User Permissions updated successfully | تم تحديث صلاحيات المستخدم بنجاح";
    }

    return {
      userId,
      assignedPermissions: permissions.map(p => p.name),
    };
  });
};

const getUserExams = async (userId,fetaures) => {
  try {
    const page = fetaures.page * 1 || 1;
    const limit = fetaures.limit * 1 || 10;
    const offset = (page - 1) * limit;
    const {count , rows} = await examReservation.findAndCountAll({
      where: { userId },
      limit,
      offset,
      attributes: ['examId'],
    });

    const examIds = rows.map(r => r.examId).filter(id => id !== null);

    if (examIds.length === 0) return [];

    
    const exams = await exam.findAll({
      where: { examId: { [Op.in]: examIds } },
      include: [
        {
          model: course,
          attributes: ['courseId', 'name'],
        }
      ]
    });

    return PaginatedResponse.fromApiFeature(
      fetaures,
      count,
      exams,
      "Exams fetched successfully"
    );
  } catch (error) {
    console.error('Erorr', error);
    throw error;
  }
};

const getUserReservations=async(userId) => {
  const data = await reservation.findAll({
    where :{userId},
    include:[
      {
        model:event,
        as:"reservationEvent",
        attributes:["eventName","startDate","endDate","startDateRes","endDateRes","status","type"],
        include:[
          {
            model: package,
            required: false,
          },
          {
            model: training,
            as: "trainings",
            required: false,
            include: [
              {
                model: trainer,
                as: "trainer",
                attributes: ["Name"],
              },
              {
                model:course,
                attributes:["name"]
              }
            ],
          },
          {
            model: exam,
            required: false,
            include: [
              {
                model: supervisor,
                as: "supervisor",
                attributes: ["Name"],
              },
              {
                model:course,
                attributes:["name"]
              }
            ],
          },
        ]
      },
    ]
  })
  return data
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
  updateStudentNationalId,
  getStudentById,
  getUsersByTrainingId,
  getUsersByExamId,
  assignPermissionsToUser,
  getUserExams,
  getUserReservations
};
