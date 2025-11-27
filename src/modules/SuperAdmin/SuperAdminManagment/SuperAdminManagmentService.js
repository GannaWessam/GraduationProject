const {User , SuperAdmin ,sequelize } = require("../../../models");
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



async function addSuperAdmin(SuperAdminInfo) {
  const { Name, email , password ,confirmPassword } = SuperAdminInfo;
  const role = "SUPERADMIN";

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

    

    // ✅ Create SuperAdmin
    const SuperAdminData = await SuperAdmin.create(
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
        SuperAdminData,
      },
    };
  });
}

async function getAllSuperAdmins() {
  return SuperAdmin.findAll({
    include: [
      {
        model: User,
        attributes: ['userId', 'email', 'role']
      }
    ]
  });
}

// Get SuperAdmin by ID
async function getSuperAdminById(id) {
  const sup = await SuperAdmin.findByPk(id, {
    include: [
      {
        model: User,
        attributes: ['userId', 'email', 'role']
      }
    ]
  });

  if (!sup) throw new Error('SuperAdmin_not_found');

  return sup;
}




module.exports = {
  addSuperAdmin,
  getAllSuperAdmins,
  getSuperAdminById,
};