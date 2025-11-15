const {User , trainer ,sequelize } = require("../../../models");
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



async function addTrainer(TrainerInfo) {
  const { Name, email , password ,confirmPassword } = TrainerInfo;
  const role = "TRAINER"

  
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
    const Trainer = await trainer.create(
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
        Trainer,
      },
    };
  });
}

async function getAllTrainers() {
  return trainer.findAll({
    include: [
      {
        model: User,
        attributes: ['userId', 'email', 'role']
      }
    ]
  });
}

// Get trainer by ID
async function getTrainerById(id) {
  const tr = await trainer.findByPk(id, {
    include: [
      {
        model: User,
        attributes: ['userId', 'email', 'role']
      }
    ]
  });

  if (!tr) throw new Error('trainer_not_found');

  return tr;
}




module.exports = {
  addTrainer,
  getAllTrainers,
  getTrainerById,
};