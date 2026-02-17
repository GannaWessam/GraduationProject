const { Model } = require("sequelize");///////////??
const { User, Student, Product ,ProductAllowedUserType,Payment } = require("../../../models");
const QRCode = require("qrcode");


const findUserByEmail = async (email, t = null) =>
  User.findOne({ where: { email }, transaction: t });

const findStudentByNationalId = async (national_id, t = null) =>
  Student.findOne({ where: { nationalId: national_id }, transaction: t });

const findProduct = async (training_type, studentType) => {
  const product = await Product.findOne({
    where: { courseName: training_type },
    include: [{ model: ProductAllowedUserType, as: "allowedUserTypes" }],
  });

  if (!product) {
    throw new Error("service_not_found");
  }

  const allowedTypes = product.allowedUserTypes.map((t) => t.userType);

  if (!allowedTypes.includes(studentType)) {
    throw new Error("this_type_not_allowed_for_this_product");
  }

  return product;
};

// const { Product, ProductAllowedUserType } = require("../../models");

const findProductById = async (productId, studentType) => {
  const product = await Product.findOne({
    where: { productId },
    include: [
      {
        model: ProductAllowedUserType,
        as: "allowedUserTypes",
        attributes: ["userType"],
      },
    ],
  });

  if (!product) {
    throw new Error("Product not found");
  }

 
  const isAllowed = product.allowedUserTypes.some(
    (p) => p.userType === studentType
  );

  if (!isAllowed) {
    throw new Error("This user type is not allowed for the selected product");
  }

  return product;
};

const getUser = async (email) => {
  const user = await User.findOne({
    where: { email },
    include: [{ model: Student }] 
  });
  
  if (!user) throw new Error("invalid_email");

  return user;
};

const getUserFees = async (userId) => {
  const user = await Payment.findAll({
    where: { userId },
    include: [{ model: Product  }] 
  });
  
  if (!user) throw new Error("invalid_email");

  return user;
};

// الـ transaction مش "لازم" في أول  functions
// لكن وجوده بيخلي الـ check جزء من الـ atomic operation كلها
const checkEmailExists = async (email, t) => {
  if (await findUserByEmail(email, t)) throw new Error("email_exists");
};

const checkNationalIdExists = async (national_id, t) => {
  if (await findStudentByNationalId(national_id, t))
    throw new Error("national_id_exists");
};

const generateQr = async (name, national_id) => {
  const qrData = `الاسم: ${name}\nالرقم القومي: ${national_id}`;

  const qrImage = await QRCode.toDataURL(qrData, { //بيرجع الصورة على شكل string يبدأ بـ data:image/png;base64
    errorCorrectionLevel: "H",
    width: 400,
    color: {
      dark: "#000000",
      light: "#ffffff"
    }
  });

  return qrImage; 
};
module.exports = {
  findUserByEmail,
  findStudentByNationalId,
  findProduct,
  checkEmailExists,
  checkNationalIdExists,
  generateQr,
  getUser,
  getUserFees,
  findProductById
};
