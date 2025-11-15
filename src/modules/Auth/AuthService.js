const sequelize = require("../../connections/db.js");
const token = require("../../middlewares/token.js");

const {
  hashPassword,
  comparePassword,
} = require("./helpers/passwordHelper");

const {
  findUserByEmail,
  findStudentByNationalId,
  checkEmailExists,
  checkNationalIdExists, 
  findProductById,
  generateQr,
  getUser,
  getUserFees
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
const { User, Student ,Payment ,productCourse, studentCourse} = require('../../models/index.js');
const { where } = require("sequelize");

async function registerUser(payload, idImage) {
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

  // ✅ Step 1: Validation
  validateRequiredFields(payload);
  validateName(name_ar);
  validatePassword(password, confirmPassword);
  // validateNationalId(nationality, national_id);

  // ✅ Step 2: Generate QR
  const qrResult = await generateQr(name_ar, national_id);

  // ✅ Step 3: Determine student status
  const status = OCR === "true" ? "approved" : "pending";

  // ✅ Step 4: Fetch product and validate allowed type
  const product = await findProductById(ProductId, type);

  // ✅ Step 5: Determine product price
  const productPrice =
    nationality === "Egypt" ? product.priceEgyptian : product.priceOther;

  // ✅ Step 6: Perform all DB actions in a transaction
  return sequelize.transaction(async (t) => {
    await checkEmailExists(email, t);
    await checkNationalIdExists(national_id, t);

    const hashedPassword = await hashPassword(password);

    // ✅ Create User
    const user = await User.create(
      { email, passwordHash: hashedPassword, role },
      { transaction: t }
    );

    // ✅ Create Payment
    await Payment.create(
      {
        userId: user.userId,
        productId: product.productId,
        status: "PENDING",
        amount: productPrice,
      },
      { transaction: t }
    );

    // ✅ Create Student
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
        nationalIdImage: idImage,
        status,
        productId: product.productId,
        profilePhoto: qrResult,
      },
      { transaction: t }
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
        examStatus: "PENDING",
        trainingStatus: "PENDING",
      }));

      const createdCourses = await studentCourse.bulkCreate(studentCourses, { transaction: t });
      assignedCourses = createdCourses.map((c) => c.courseId);
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


async function loginUser(email, password) {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("invalid_email");

  const student = await Student.findOne({where : {userId : user.userId}});
  // user.Student = student;

  // console.log(student);
  
  await comparePassword(password, user.passwordHash);

  const tok = token.generateToken(
    email,
    student?.fullName,
    user.userId,
    user.role,
    student?.NameEn,
    student?.productId,
    student?.status

  );

  return formatLoginResponse(user, tok);//msh 3ayz el name?
}

async function resetPassword(email, newPassword) {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("invalid_email");

  validatePassword(newPassword, newPassword);

  user.passwordHash = await hashPassword(newPassword);
  await user.save();

  return { email: user.email };
}

///mkanha msh hna
async function getuser (email) {
  const user = await getUser(email);
  return { user };
}

async function getuserfees (userId) {
  const fees = await getUserFees(userId);
  return { fees };
}

async function verifyEmail(email) {
    
  const user = await User.findOne({ where: { email }});

  if (!user) throw new Error('invalid_email');

  return {email: user.email}

  };


module.exports = { registerUser, loginUser, resetPassword , verifyEmail ,getuser ,getuserfees };
