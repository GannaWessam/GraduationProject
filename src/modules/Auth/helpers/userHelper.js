const { Model } = require("sequelize");
const { User, Student, Product } = require("../../../models");
const QRCode = require("qrcode");


const findUserByEmail = async (email, t = null) =>
  User.findOne({ where: { email }, transaction: t });

const findStudentByNationalId = async (national_id, t = null) =>
  Student.findOne({ where: { nationalId: national_id }, transaction: t });

const findProduct = async (training_type, nationality) => {
  const category = nationality === "Egypt" ? "egyptian" : "other";
  const product = await Product.findOne({
    where: { product: training_type, Category: category },
  });
  if (!product) throw new Error("not found service");
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

const checkEmailExists = async (email, t) => {
  if (await findUserByEmail(email, t)) throw new Error("email_exists");
};

const checkNationalIdExists = async (national_id, t) => {
  if (await findStudentByNationalId(national_id, t))
    throw new Error("national_id_exists");
};

const generateQr = async (name, national_id) => {
  const qrData = `الاسم: ${name}\nالرقم القومي: ${national_id}`;

  const qrImage = await QRCode.toDataURL(qrData, {
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
  getUser
};
