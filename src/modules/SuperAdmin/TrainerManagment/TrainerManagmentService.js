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

async function getAllTrainers(features) {
  const { count, rows: trainers } = await trainer.findAndCountAll({
    ...features.options, 
    include: [
      {
        model: User,
        attributes: ["userId", "email", "role"],
      },
    ],
  });

  if (!trainers) throw new Error("not_found");

  return PaginatedResponse.fromApiFeature(
    features,
    count,
    trainers,
    "Trainers fetched successfully"
  );
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
async function deleteTrainer(id) {
  const trainerData = await trainer.findByPk(id);

  if (!trainerData) throw new Error("trainer_not_found");

  const userId = trainerData.userId;

  await sequelize.transaction(async (t) => {
    await trainerData.destroy({ transaction: t });
    await User.destroy({ where: { userId }, transaction: t });
  });

  return {
    success: true,
    message: "trainer and related user deleted",
  };
}   

async function updateTrainer(id, updateData) {
  const trainerData = await trainer.findByPk(id, {
    include: [{ model: User }] 
  });

  if (!trainerData) throw new Error("trainer_not_found");

  const { Name, email, password, confirmPassword } = updateData;


  if (Name) trainerData.Name = Name;


  if (email && trainerData.User.email !== email) {
    await checkEmailExists(email);
    trainerData.User.email = email;
  }

  
  if (password) {
    if (!confirmPassword) {
      throw new Error("confirmPassword_required");
    }

    validatePassword(password, confirmPassword);

    const hashed = await hashPassword(password);
    trainerData.User.passwordHash = hashed;
  }

  // Save both SuperAdmin + User in transaction
  await sequelize.transaction(async (t) => {
    await trainerData.save({ transaction: t });
    await trainerData.User.save({ transaction: t });
  });

  return {
    success: true,
    message: "trainer updated successfully",
    data: trainerData,
  };
}



module.exports = {
  addTrainer,
  getAllTrainers,
  getTrainerById,
  updateTrainer,
  deleteTrainer
};