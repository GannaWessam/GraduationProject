const { Error } = require("sequelize");
const ExcelJS = require("exceljs");
const ReportService = require("../../../Services/ReportService");
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
  supervisor,
  college,
  university
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
const { splitLang } = require("../../../Helpers/langHelper");
const { model } = require("mongoose");

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
    subQuery: false,
    include: [
      {
        model: User,
        attributes: ["email"],
        include: [
          {
            model: Payment,
            attributes: ["amount", "status", "timestamp"],
          },
        ],
      },
      {
        model:Product,
        attributes:["courseName"],
      }
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
  await User.increment("tokenVersion", { where: { userId: student.userId } });
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
      },
      {
        model: User,
        attributes: ["email"],
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

const exportPaidStudentsExcel = async () => {
  const students = await Student.findAll({
    where: {
      status: "paid",
    },
    attributes: [
      "fullName",
      "nationalId",
      "Mobile",
    ],
    order: [["fullName", "ASC"]],
  });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Paid Students");

  worksheet.columns = [
    {
      header: "Full Name",
      key: "fullName",
      width: 35,
    },
    {
      header: "National ID",
      key: "nationalId",
      width: 25,
    },
    {
      header: "Mobile",
      key: "mobile",
      width: 20,
    },
  ];

  students.forEach((student) => {
    worksheet.addRow({
      fullName: student.fullName,
      nationalId: student.nationalId,
      mobile: student.Mobile,
    });
  });

  worksheet.getRow(1).font = {
    bold: true,
  };

  return workbook;
};

const exportUsersExcel = async (features) => {
  const { rows: students } = await Student.findAndCountAll({
    ...features.options,
    include: [
      {
        model: User,
        attributes: ["email"],
      },
    ],
  });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Students");

  worksheet.columns = [
    { header: "Full Name", key: "fullName", width: 35 },
    { header: "National ID", key: "nationalId", width: 25 },
    { header: "Mobile", key: "mobile", width: 20 },
    { header: "College", key: "college", width: 35 },
    { header: "Email", key: "email", width: 35 },
    { header: "Status", key: "status", width: 20 },
  ];

  students.forEach((student) => {
    worksheet.addRow({
      fullName: student.fullName,
      nationalId: student.nationalId,
      mobile: student.Mobile,
      college: splitLang(student.college).ar,
      email: student.User?.email || "",
      status: student.status,
    });
  });

  worksheet.getRow(1).font = { bold: true };

  return workbook;
};

const getUsersByEventIdService = async (eventId, features) => {
  const options = features.options || {};

  const { count, rows } = await reservation.findAndCountAll({
    where: {
      eventId,
    },
    attributes: [],
    include: [
      {
        model: Student,
        attributes: [
          "userId",
          "fullName",
          "NameEn",
          "Mobile",
          "nationalId",
          "college",
          "university",
          "department",
        ],
        include: [
          {
            model: User,
            attributes: ["email"],
          },
        ],
        where: options.where || {},
      },
    ],
    limit: options.limit,
    offset: options.offset,
    order: options.order,
    distinct: true,
  });

  const users = rows.map((item) => ({
    userId: item.Student.userId,
    fullName: item.Student.fullName,
    email: item.Student.User?.email,
    mobile: item.Student.Mobile,
    nationalId: item.Student.nationalId,
    college: item.Student.college,
    university  : item.Student.university,
    NameEn: item.Student.NameEn,
    department: item.Student.department
  }));

  return PaginatedResponse.fromApiFeature(
    features,
    count,
    users,
    "Event users fetched successfully"
  );
};


const exportUsers = async (features, status, type = "excel") => {
  const where = { ...(features.options?.where || {}) };

  if (status) {
    if (status.startsWith("!")) {
      where.status = {
        [Op.ne]: status.substring(1),
      };
    } else {
      where.status = status;
    }
  }

  const students = await Student.findAll({
    ...features.options,
    where,
    include: [
      {
        model: User,
        attributes: ["email"],
        include: [
          {
            model: Payment,
            attributes: ["amount", "status", "timestamp"],
          },
        ],
      },
      {
        model: Product,
        attributes: ["courseName"],
      },
    ],
  });

  if (!students.length) throw new Error("not_found");

  if (type === "pdf") {
    const reportService = new ReportService();

    function reverseWords(text) {
      if (!text) return "";
  
      return text
          .toString()
          .trim()
          .split(/\s+/)
          .reverse()
          .join("  ");
  }

    const columns = [
      { title: reverseWords("الكلية"), width: 100 },
      { title: reverseWords("البريد الالكتروني"), width: 150 },
      { title: reverseWords("الهاتف"), width: 80 },
      { title: reverseWords("الرقم القومي"), width: 70 },
      { title: reverseWords("الاسم"), width: "*" },
    ];

    // const statusMap = {
    //   approved:reverseWords( "قيد انتظار عملية الدفع"),
    //   pending:reverseWords( "قيد انتظار مراجعة البيانات"),
    //   paid: reverseWords("تم الدفع بنجاح"),
    //   succeeded:reverseWords( "انتهى من أداء الدورة"),
    //   "reserved training": reverseWords("تم حجز التدريب"),
    //   "reserved exam":reverseWords( "تم حجز الامتحان"),
    //   "finish training":reverseWords( "تم الانتهاء من التدريب"),
    //   failed: reverseWords("راسب"),
    // };

    const rows = students.map((student) => [
      reverseWords(splitLang(student.college).ar),
      student.User?.email || "",
      student.Mobile,
      student.nationalId,
      reverseWords(student.fullName),
    ]);

    return reportService.generate({
      title: "تقرير الطلاب",
      columns,
      rows,
    });
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Students", {
    views: [{ rightToLeft: true }],
  });

  worksheet.columns = [

    { header: "الاسم", key: "fullName", width: 35 },
    { header: "الرقم القومي", key: "nationalId", width: 25 },
    { header: "البريد الإلكتروني", key: "email", width: 35 },
    { header: "الهاتف", key: "mobile", width: 20 },
    { header: "الكلية", key: "college", width: 35 },
    { header: "الحالة", key: "status", width: 30 },
  ];

  const statusMap = {
    approved: "قيد انتظار عملية الدفع",
    pending: "قيد انتظار مراجعة البيانات",
    paid: "تم الدفع بنجاح",
    succeeded: "انتهى من أداء الدورة",
    "reserved training": "تم حجز التدريب",
    "reserved exam": "تم حجز الامتحان",
    "finish training": "تم الانتهاء من التدريب",
    failed: "راسب",
  };

  students.forEach((student) => {
    worksheet.addRow({
      fullName: student.fullName,
      nationalId: student.nationalId,
      mobile: student.Mobile,
      college: splitLang(student.college).ar,
      email: student.User?.email || "",
      status: statusMap[student.status] || student.status,
    });
  });

  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
      };
    });
  });
  
  worksheet.getRow(1).font = { bold: true };

  return workbook;
};


const passTrainingService = async (userId) => {
  const transaction = await sequelize.transaction();

  try {
    const student = await Student.findOne({
      where: { userId },
      transaction,
    });

    if (!student) {
      throw new Error("Student not found");
    }

  
    const allowedStatuses = ["PAID", "reserved Training"];


    if (!allowedStatuses.includes(student.status)) {
      throw new Error("Student must have status paid, reserved training");
    }

    await Student.update(
      {
        status: "Finish Training",
      },
      {
        where: { userId },
        transaction,
      }
    );

    await User.increment("tokenVersion", {
      by: 1,
      where: { userId },
      transaction,
    });

    await studentCourse.update(
      {
        trainingStatus: "done",
      },
      {
        where: { userId },
        transaction,
      }
    );

    await transaction.commit();

    return {
      message: "Training passed successfully",
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const switchUserProduct = async (userId, newProductId,req) => {
  const transaction = await sequelize.transaction();

  try {
    const student = await Student.findByPk(userId, {
      transaction,
    });
    
    if (!student) {
      throw new Error("Student not found");
    }
    
    if (!["approved", "pending"].includes(student.status?.toLowerCase())) {
      throw new Error(
        `Student status (${student.status}) is not allowed for product switching`
      );
    }

    const product = await Product.findByPk(newProductId, {
      transaction,
    });

    if (!product) {
      throw new Error("Product not found");
    }

    const oldProductId = student.productId;

    const isEgyptian =
      student.nationality === "Egyptian | مصري" ;

    await student.update(
      {
        productId: newProductId,
      },
      { transaction }
    );

    // const paidPayment = await Payment.findOne({
    //   where: {
    //     userId,
    //     productId: oldProductId,
    //     status: "PAID",
    //   },
    //   transaction,
    // });
    
    // if (paidPayment) {
    //   throw new Error(
    //     "Cannot switch product because payment is already PAID"
    //   );
    // }

    const paymentWhere = {
      userId,
      productId: oldProductId,
      status: {
        [Op.in]: ["PENDING", "FAILED"],
      },
    };

    if (isEgyptian) {
      await Payment.update(
        {
          productId: newProductId,
          receiptId: product.receiptId,
          amount: product.priceEgyptian,
        },
        {
          where: paymentWhere,
          transaction,
        }
      );
    } else {
      await Payment.update(
        {
          productId: newProductId,
          receiptId: product.receiptIdOthers,
          amount: product.priceOther,
          currencyId: product.currencyId,
        },
        {
          where: paymentWhere,
          transaction,
        }
      );
    }

    await transaction.commit();

    if(req?.audit)
    {   
      
      req.audit.affectedUser = { name: student.fullName };
      req.audit.user = { _id: req.userData.id, name: req.userData.name, email: req.userData.email };
      req.audit.message =
        "User Product switched successfully | تم تغيير منتج المستخدم بنجاح";
    }

    return {
      userId,
      oldProductId,
      newProductId,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};


const cancelReservation = async (userId, eventId , req) => {
  return sequelize.transaction(async (t) => {

    const studentData = await Student.findByPk(userId, {
      attributes: [
        "userId",
        "fullName",
        "NameEn",
        "nationalId",
      ],
      transaction: t,
    });

    // 1️⃣ Get event with lock
    const eventData = await event.findOne({
      where: { eventId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!eventData) {
      throw new Error("Event not found");
    }

    if (new Date() >= new Date(eventData.startDate)) {
      throw new Error("Cannot cancel reservation after event has started");
    }

    // 2️⃣ Get user's reservation
    const reservationData = await reservation.findOne({
      where: {
        userId,
        eventId,
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!reservationData) {
      throw new Error("Reservation not found");
    }

    // 3️⃣ Delete exam/training reservation
    if (eventData.type === "exam") {
      await examReservation.destroy({
        where: {
          reservationId: reservationData.reservationId,
          userId,
        },
        transaction: t,
      });
    }

    if (eventData.type === "training") {
      await trainingReservation.destroy({
        where: {
          reservationId: reservationData.reservationId,
          userId,
        },
        transaction: t,
      });
    }

    // 4️⃣ Get course IDs
    let courseIds = [];

    // Event belongs to Package
    if (eventData.packageId) {
      const packageCourses = await packageCourse.findAll({
        where: {
          packageId: eventData.packageId,
        },
        attributes: ["courseId"],
        transaction: t,
      });

      courseIds = packageCourses.map((item) => item.courseId);
    }

    // Event does NOT belong to Package
    else {
      if (eventData.type === "exam") {
        const examData = await exam.findOne({
          where: {
            eventId,
          },
          attributes: ["courseId"],
          transaction: t,
        });

        if (examData?.courseId) {
          courseIds.push(examData.courseId);
        }
      }

      if (eventData.type === "training") {
        const trainingData = await training.findOne({
          where: {
            eventId,
          },
          attributes: ["courseId"],
          transaction: t,
        });

        if (trainingData?.courseId) {
          courseIds.push(trainingData.courseId);
        }
      }
    }

    // 5️⃣ Reset student course status
    if (courseIds.length > 0) {
      const updateData = {};

      if (eventData.type === "exam") {
        updateData.examStatus = "pending";
      }

      if (eventData.type === "training") {
        updateData.trainingStatus = "pending";
      }

      await studentCourse.update(updateData, {
        where: {
          userId,
          courseId: {
            [Op.in]: courseIds,
          },
        },
        transaction: t,
      });

      if (eventData.type === "exam") {
        await studentCourse.decrement("attempts", {
          by: 1,
          where: {
            userId,
            courseId: {
              [Op.in]: courseIds,
            },
            attempts: {
              [Op.gt]: 0,
            },
          },
          transaction: t,
        });
      }
    }

const studentCourses = await studentCourse.findAll({
  where: {
    userId,
  },
  attributes: ["trainingStatus", "examStatus"],
  transaction: t,
});

let newStudentStatus;

if (eventData.type === "training") {
  const hasReservedOrDoneTraining = studentCourses.some(
    (course) =>
      course.trainingStatus === "reserved" ||
      course.trainingStatus === "done"
  );

  if (hasReservedOrDoneTraining) {
    newStudentStatus = "reserved Training";
  } else {
    newStudentStatus = "PAID";
  }
}

if (eventData.type === "exam") {
  const hasDoneExam = studentCourses.some(
    (course) => course.examStatus === "done"
  );

  if (hasDoneExam) {
    newStudentStatus = "reserved Exam";
  } else {
    newStudentStatus = "Finish Training";
  }
}

if (newStudentStatus) {
  await Student.update(
    {
      status: newStudentStatus,
    },
    {
      where: {
        userId,
      },
      transaction: t,
    }
  );
}

    // 6️⃣ Delete main reservation
    await reservationData.destroy({
      transaction: t,
    });

    // 7️⃣ Decrease registered count
    await eventData.decrement("numberOfRegistered", {
      by: 1,
      transaction: t,
    });

    if (req?.audit) {
      req.audit.affectedUser = {
        _id: studentData?.userId,
        name: studentData?.fullName,
      };

      req.audit.affectedThing = {
        name: eventData.eventName,
        eventId: eventData.eventId,
      };

      req.audit.message =
        "Admin cancelled student's reservation | قام الأدمن بإلغاء حجز الطالب";
    }

    return {
      success: true,
      message: "Reservation cancelled successfully",
    };
  });
};



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
  getUserReservations,
  exportPaidStudentsExcel,
  exportUsersExcel,
  getUsersByEventIdService,
  exportUsers,
  passTrainingService,
  switchUserProduct,
  cancelReservation
};
