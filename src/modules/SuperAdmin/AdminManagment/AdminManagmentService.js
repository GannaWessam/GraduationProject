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

async function deleteAdmin(id) {
  const admin = await Admin.findByPk(id);

  if (!admin) throw new Error("admin_not_found");

  const userId = admin.userId;

  await sequelize.transaction(async (t) => {
    await admin.destroy({ transaction: t });
    await User.destroy({ where: { userId }, transaction: t });
  });

  return {
    success: true,
    message: "Admin and related user deleted",
  };
}   

async function updateAdmin(id, updateData) {
  const admin = await Admin.findByPk(id, {
    include: [{ model: User }] 
  });

  if (!admin) throw new Error("Admin_not_found");

  const { Name, email, password, confirmPassword } = updateData;


  if (Name) admin.Name = Name;


  if (email && admin.User.email !== email) {

    await checkEmailExists(email);
    admin.User.email = email;
  }

  
  if (password) {
    if (!confirmPassword) {
      throw new Error("confirmPassword_required");
    }

    validatePassword(password, confirmPassword);

    const hashed = await hashPassword(password);
    admin.User.passwordHash = hashed;
  }

  // Save both SuperAdmin + User in transaction
  await sequelize.transaction(async (t) => {
    await admin.save({ transaction: t });
    await admin.User.save({ transaction: t });
  });

  return {
    success: true,
    message: "Admin updated successfully",
    data: admin,
  };
}




module.exports = {
  addAdmin,
  getAllAdmins,
  getAdminById,
  deleteAdmin,
  updateAdmin
};