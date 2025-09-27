const { User, Student, Product } = require("../../../models");

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

const checkEmailExists = async (email, t) => {
  if (await findUserByEmail(email, t)) throw new Error("email_exists");
};

const checkNationalIdExists = async (national_id, t) => {
  if (await findStudentByNationalId(national_id, t))
    throw new Error("national_id_exists");
};

module.exports = {
  findUserByEmail,
  findStudentByNationalId,
  findProduct,
  checkEmailExists,
  checkNationalIdExists,
};
