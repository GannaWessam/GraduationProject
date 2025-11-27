const {User , Admin ,sequelize } = require("../../../models");
const ApiFeature = require("../../../Util/ApiResponse");
const PaginatedResponse = require("../../../Util/PaginatedResponse");
const { Op } = require("sequelize");
const {
    hashPassword,
    comparePassword,
  } = require("../../Auth/helpers/passwordHelper");
  const {
    findUserByEmail,
    findStudentByNationalId,
    checkEmailExists,
    checkNationalIdExists, 
    findProductById,
    generateQr,
    getUser,
    getUserFees
  } = require("../../Auth/helpers/userHelper");
  const {
    validateRequiredFields,
    validateName,
    validatePassword,
    validateNationalId,
    
  } = require("../../Auth/validations/registerValidation");




async function addAdmin(AdminInfo) {
  const { Name, email , password ,confirmPassword } = AdminInfo;
  const role = "ADMIN";

  if(!Name || !email || !password || !confirmPassword ){
    throw new Error('missing_required_fields');
  }

  
  validateName(Name);
  validatePassword(password, confirmPassword);
  

  
  return sequelize.transaction(async (t) => {
    await checkEmailExists(email, t);

    const hashedPassword = await hashPassword(password);

    // ✅ Create User
    const user = await User.create(
      { email, passwordHash: hashedPassword, role },
      { transaction: t }
    );

    

    // ✅ Create Admin
    const AdminData = await Admin.create(
      {
        userId: user.userId,
        Name: Name,
      },
      { transaction: t }
    );
    // ✅ Return the formatted response
    return {
      success: true,
      message: "Registration completed successfully",
      data: {
        user,
        AdminData,
      },
    };
  });
}

async function getAllAdmins() {
  return Admin.findAll({
    include: [
      {
        model: User,
        attributes: ['userId', 'email', 'role']
      }
    ]
  });
}

// Get SuperAdmin by ID
async function getAdminById(id) {
  const admin = await Admin.findByPk(id, {
    include: [
      {
        model: User,
        attributes: ['userId', 'email', 'role']
      }
    ]
  });

  if (!admin) throw new Error('Admin_not_found');

  return admin;
}




module.exports = {
  addAdmin,
  getAllAdmins,
  getAdminById,
};