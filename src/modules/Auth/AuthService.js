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
const { User, Student ,Payment } = require('../../models/index.js');
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
  

let status ;
if(OCR === "true"){
  status = "active"
}else{
  status = "PENDING"
}
const product = await findProduct(training_type, type);

let productPrice ;

if(nationality === "Egypt"){
  productPrice = product.priceEgyptian
}else{
  productPrice = product.priceOther
}


  return sequelize.transaction(async (t) => {
    await checkEmailExists(email, t);
    await checkNationalIdExists(national_id, t);

    const hashedPassword = await hashPassword(password);

    const user = await User.create(
      { email, passwordHash: hashedPassword, role },
      { transaction: t }
    );

    const payment = await Payment.create(
      { userId:user.userId, productId:product.productId,status: "PENDING" ,amount:productPrice},
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
        status,
        profilePhoto:res
      },
      { transaction: t }
    );

    return formatRegisterResponse(user, student, product.price);
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
