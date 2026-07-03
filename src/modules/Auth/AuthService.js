const sequelize = require("../../connections/db.js");
const token = require("../../middlewares/token.js");

const { hashPassword, comparePassword } = require("./helpers/passwordHelper");

const {
  findUserByEmail,
  findStudentByNationalId,
  checkEmailExists,
  checkNationalIdExists,
  findProductById,
  generateQr,
  getUser,
  getUserFees,
  RegisterService,
} = require("./helpers/userHelper");

const {
  validateRequiredFields,
  validateName,
  validatePassword,
  validateNationalId,
} = require("./validations/registerValidation");

const {
  formatRegisterResponse,
  formatLoginResponse,
} = require("./helpers/responseHelper");
const {
  User,
  Student,
  Payment,
  productCourse,
  studentCourse,
  Admin,
  supervisor,
  trainer,
  SuperAdmin,
} = require("../../models/index.js");
const { where } = require("sequelize");

async function registerUser(payload, idImage, req) {
  const {
    OCR,
    email,
    password,
    confirmPassword,
    name_ar,
    name_En,
    StudyLan,
    national_id,
    nationality,
    university,
    faculty,
    department,
    Mobile,
    ProductId,
    type,
    role = "STUDENT",
  } = payload;

  validateRequiredFields(payload);
  validateName(name_ar);
  validatePassword(password, confirmPassword);

  const qrResult = await generateQr(
    name_ar,
    national_id,
    idImage.front
  );

  const status = OCR === "true" ? "approved" : "pending";

  const product = await findProductById(ProductId, type);

  const productPrice =
    nationality === "Egypt" ? product.priceEgyptian : product.priceOther;

  return sequelize.transaction(async (t) => {
    await checkEmailExists(email, t);
    await checkNationalIdExists(national_id, t);

    const hashedPassword = await hashPassword(password);

    // ✅ Create User
    const user = await User.create(
      { email, passwordHash: hashedPassword, role },
      { transaction: t },
    );

    const student = await Student.create(
      {
        userId: user.userId,
        type,
        fullName: name_ar,
        NameEn: name_En,
        StudyLan,
        Mobile,
        nationality,
        nationalId: national_id,
        university,
        college: faculty,
        department,
        nationalIdImage: idImage.front,
        nationalIdImageBack:idImage.back,
        status,
        productId: product.productId,
        profilePhoto: qrResult,
      },
      { transaction: t },
    );

    // ✅ Assign all courses from productCourse
    const productCourses = await productCourse.findAll({
      where: { productId: product.productId },
      transaction: t,
    });

    let assignedCourses = [];
    if (productCourses.length > 0) {
      const studentCourses = productCourses.map((pc) => ({
        userId: user.userId,
        courseId: pc.courseId,
        examStatus: "registing",
        trainingStatus: "registing",
      }));

      const createdCourses = await studentCourse.bulkCreate(studentCourses, {
        transaction: t,
      });
      assignedCourses = createdCourses.map((c) => c.courseId);
    }

    await RegisterService(user.userId,product.productId,req ,t);
    if (req && req.audit) {
      req.audit.user = {
        _id: user.userId,
        email: user.email,
        name: name_ar,
      };
      req.audit.message =
        "User registered successfully | تم تسجيل المستخدم بنجاح";
    }

    // ✅ Return the formatted response
    return {
      success: true,
      message: "Registration completed successfully",
      data: {
        user,
        student,
        product: {
          id: product.productId,
          name: product.courseName,
          price: productPrice,
        },
        assignedCourses, // ✅ Array of course IDs assigned to student
      },
    };
  });
}

async function loginUser(email, password, rememberMe = false, req) {
  const user = await findUserByEmail(email);
  if (!user) {
    if (req?.audit) {
      req.audit.user = {
        email: email,
      };
      req.audit.message =
        "Failed login attempt (user not found) | محاولة تسجيل دخول فاشلة (المستخدم غير موجود)";
    }

    throw new Error("Failed login attempt");
  }

  let USER;
  let NAME;
  if (user.role === "STUDENT") {
    USER = await Student.findOne({ where: { userId: user.userId } });
    NAME = USER.fullName;
  } else if (user.role === "ADMIN") {
    USER = await Admin.findOne({ where: { userId: user.userId } });
    NAME = USER.Name;
  } else if (user.role === "SUPERVISOR") {
    USER = await supervisor.findOne({ where: { userId: user.userId } });
    NAME = USER.Name;
  } else if (user.role === "SUPERADMIN") {
    USER = await SuperAdmin.findOne({ where: { userId: user.userId } });
    NAME = USER.Name;
  } else {
    USER = await trainer.findOne({ where: { userId: user.userId } });
    NAME = USER.Name;
  }

  try {
    await comparePassword(password, user.passwordHash);
  } catch (err) {
    
    if (req?.audit) {
      req.audit.user = {
        _id: user.userId,
        email: user.email,
      };

      req.audit.message =
        "Failed login attempt (wrong password) | محاولة تسجيل دخول فاشلة (كلمة مرور خاطئة)";
    }
    throw new Error("Failed login attempt");
  }
  const permissions = await user.getPermissions({
    attributes: ["name"],
  });
  const jwtToken = token.generateToken(
    email,
    NAME,
    user.userId,
    user.role,
    USER?.NameEn,
    USER?.productId,
    USER?.status,
    rememberMe,
    user.tokenVersion,
  );

  if (req && req.audit) {
    req.audit.user = {
      _id: user.userId,
      email: user.email,
      name: NAME,
    };

    req.audit.message =
      "User logged in successfully | تم تسجيل دخول المستخدم بنجاح";
  }
  return formatLoginResponse(
    user,
    jwtToken,
    permissions.map((p) => p.name),
  ); //msh 3ayz el name?
}

async function resetPassword(email, newPassword, req) {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("invalid_email");

  validatePassword(newPassword, newPassword);

  user.passwordHash = await hashPassword(newPassword);
  await user.save();

  if (req && req.audit) {
    req.audit.user = {
      _id: user.userId,
      email: user.email,
      name: user.email,
    };
    req.audit.message =
      "User password reset successfully | تم إعادة تعيين كلمة مرور المستخدم بنجاح";
  }

  return { email: user.email };
}

///mkanha msh hna
async function getuser(email, req) {
  const user = await getUser(email);

  if (req && req.audit) {
    req.audit.affectedUser = {
      _id: user.userId,
      email: user.email,
      name: user.Student?.fullName || user.email,
    };
    req.audit.message =
      "Fetched user details by email | تم جلب بيانات المستخدم بواسطة البريد الإلكتروني";
  }

  return { user };
}

async function getuserfees(userId, req) {
  const fees = await getUserFees(userId);

  if (req && req.audit) {
    req.audit.affectedUser = {
      _id: userId,
    };
    req.audit.message = "Fetched user fees | تم جلب الرسوم الخاصة بالمستخدم";
  }

  return { fees };
}

async function verifyEmail(email, req) {
  const user = await User.findOne({ where: { email } });

  if (!user) throw new Error("invalid_email");

  if (req && req.audit) {
    req.audit.affectedUser = {
      _id: user.userId,
      email: user.email,
    };
    req.audit.message =
      "Verified user email | تم التحقق من بريد المستخدم الإلكتروني بنجاح";
  }

  return { email: user.email };
}

module.exports = {
  registerUser,
  loginUser,
  resetPassword,
  verifyEmail,
  getuser,
  getuserfees,
};
