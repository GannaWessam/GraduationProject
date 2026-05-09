const { User, trainer, sequelize, Permission } = require("../../../models");
const PaginatedResponse = require("../../../Util/PaginatedResponse");
const { hashPassword } = require("../../Auth/helpers/passwordHelper");
const { checkEmailExists } = require("../../Auth/helpers/userHelper");
const {
  validateName,
  validatePassword,
} = require("../../Auth/validations/registerValidation");

async function addTrainer(TrainerInfo,req) {
  const { Name, email, password, confirmPassword } = TrainerInfo;
  const role = "TRAINER";

  validateName(Name);
  validatePassword(password, confirmPassword);

  return sequelize.transaction(async (t) => {
    await checkEmailExists(email, t);

    const hashedPassword = await hashPassword(password);

    // ✅ Create User
    const user = await User.create(
      { email, passwordHash: hashedPassword, role },
      { transaction: t },
    );

    // ✅ Create Trainer
    const Trainer = await trainer.create(
      {
        userId: user.userId,
        Name: Name,
      },
      { transaction: t },
    );

    req.audit.affectedUser = {
      _id: Trainer.userId,
      email: user.email,
      name: Trainer.Name,
    };

    req.audit.message =
      "Trainer added successfully | تم إضافة المدرب بنجاح";
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
    subQuery: false, 
    distinct: true,
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
    "Trainers fetched successfully",
  );
}

// Get trainer by ID
async function getTrainerById(id) {
  const tr = await trainer.findByPk(id, {
    include: [
      {
        model: User,
        attributes: ["userId", "email", "role"],
        include: [
          {
            model: Permission,
            as: "permissions",
            attributes: ["permissionId", "name","viewName"],
            through: {
              attributes: [],
            },
          },
        ],
      },
    ],
  });

  if (!tr) throw new Error("trainer_not_found");

  return tr;
}
async function deleteTrainer(id,req) {
  const trainerData = await trainer.findByPk(id, {
    include: [{ model: User }],
  });

  if (!trainerData) throw new Error("trainer_not_found");

  const userId = trainerData.userId;

  await sequelize.transaction(async (t) => {
    await trainerData.destroy({ transaction: t });
    await User.destroy({ where: { userId }, transaction: t });
  });

  req.audit.affectedUser = {
    _id: trainerData.userId,
    email: trainerData.User.email,
    name: trainerData.Name,
  };

  req.audit.message =
    "Trainer deleted successfully | تم حذف المدرب بنجاح";

  return {
    success: true,
    message: "trainer and related user deleted",
  };
}

async function updateTrainer(id, updateData,req) {
  const trainerData = await trainer.findByPk(id, {
    include: [{ model: User }],
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


  req.audit.affectedUser = {
    _id: trainerData.userId,
    email: trainerData.User.email,
    name: trainerData.Name,
  };

  req.audit.message =
    "Trainer updated successfully | تم تحديث بيانات المدرب بنجاح";
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
  deleteTrainer,
};
