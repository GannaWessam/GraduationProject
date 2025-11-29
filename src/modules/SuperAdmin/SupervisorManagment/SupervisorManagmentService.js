const {User , supervisor ,sequelize } = require("../../../models");
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



async function addSupervisor(SupervisorInfo) {
  const { Name, email , password ,confirmPassword } = SupervisorInfo;
  const role = "SUPERVISOR"

  
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

    

    // ✅ Create Student
    const Supervisor = await supervisor.create(
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
        Supervisor,
      },
    };
  });
}

async function getAllSupervisors() {
  return supervisor.findAll({
    include: [
      {
        model: User,
        attributes: ['userId', 'email', 'role']
      }
    ]
  });
}

// Get trainer by ID
async function getSupervisorById(id) {
  const sup = await supervisor.findByPk(id, {
    include: [
      {
        model: User,
        attributes: ['userId', 'email', 'role']
      }
    ]
  });

  if (!sup) throw new Error('Supervisor_not_found');

  return sup;
}   


async function updateSupervisor(id, updateData) {
  const supervisorData = await supervisor.findByPk(id, {
    include: [{ model: User }] 
  });

  if (!supervisorData) throw new Error("supervisor_not_found");

  const { Name, email, password, confirmPassword } = updateData;


  if (Name) supervisorData.Name = Name;


  if (email && !supervisorData.User.email === email) {
    await checkEmailExists(email);
    supervisorData.User.email = email;
  }

  
  if (password) {
    if (!confirmPassword) {
      throw new Error("confirmPassword_required");
    }

    validatePassword(password, confirmPassword);

    const hashed = await hashPassword(password);
    supervisorData.User.passwordHash = hashed;
  }

  // Save both SuperAdmin + User in transaction
  await sequelize.transaction(async (t) => {
    await supervisorData.save({ transaction: t });
    await supervisorData.User.save({ transaction: t });
  });

  return {
    success: true,
    message: "supervisor updated successfully",
    data: supervisorData,
  };
} 

async function deleteSupervisor(id) {
  const supervisorData = await supervisor.findByPk(id);

  if (!supervisorData) throw new Error("trainer_not_found");

  const userId = supervisorData.userId;

  await sequelize.transaction(async (t) => {
    await supervisorData.destroy({ transaction: t });
    await User.destroy({ where: { userId }, transaction: t });
  });

  return {
    success: true,
    message: "supervisor and related user deleted",
  };
}   




module.exports = {
  addSupervisor,
  getAllSupervisors,
  getSupervisorById,
  deleteSupervisor,
  updateSupervisor
};