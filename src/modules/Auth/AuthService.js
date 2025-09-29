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
  findProduct,
  generateQr,
  getUser
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
const { User, Student } = require('../../models/index.js');

async function registerUser(payload, idImage) {
  const {
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
    training_type,
    type,
    role = "STUDENT",
  } = payload;

  
  validateRequiredFields(payload);
  validateName(name_ar);
  validatePassword(password, confirmPassword);
  validateNationalId(nationality, national_id);
  const res = await generateQr(name_ar , national_id);
  
  console.log(res);
  


const product = await findProduct(training_type, type);


  return sequelize.transaction(async (t) => {
    await checkEmailExists(email, t);
    await checkNationalIdExists(national_id, t);

    const hashedPassword = await hashPassword(password);

    const user = await User.create(
      { email, passwordHash: hashedPassword, role },
      { transaction: t }
    );

    const student = await Student.create(
      {
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
        courseType: training_type,
        userId: user.userId,
      },
      { transaction: t }
    );

    return formatRegisterResponse(user, student, product.price);
  });
}

async function loginUser(email, password) {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("invalid_email");

  const student = await findStudentByNationalId(user.userId);
  user.Student = student;

  await comparePassword(password, user.passwordHash);

  const tok = token.generateToken(
    email,
    user.Student?.fullName,
    user.userId,
    user.role
  );

  return formatLoginResponse(user, tok);
}

async function resetPassword(email, newPassword) {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("invalid_email");

  validatePassword(newPassword, newPassword);

  user.passwordHash = await hashPassword(newPassword);
  await user.save();

  return { email: user.email };
}

async function getuser (email) {
  const user = await getUser(email);
  return { user };
}

module.exports = { registerUser, loginUser, resetPassword , getuser};
