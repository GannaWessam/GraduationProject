const { User, supervisor, sequelize, Permission } = require("../../../models");
const PaginatedResponse = require("../../../Util/PaginatedResponse");
const { Op } = require("sequelize");
const { hashPassword } = require("../../Auth/helpers/passwordHelper");
const { checkEmailExists } = require("../../Auth/helpers/userHelper");
const {
  validateName,
  validatePassword,
} = require("../../Auth/validations/registerValidation");

async function addSupervisor(SupervisorInfo, req) {
  const { Name, email, password, confirmPassword } = SupervisorInfo;
  const role = "SUPERVISOR";

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

    // ✅ Create Supervisor
    const Supervisor = await supervisor.create(
      {
        userId: user.userId,
        Name: Name,
      },
      { transaction: t },
    );
    // ✅ Return the formatted response

    req.audit.affectedUser = {
      _id: Supervisor.userId,
      email: user.email,
      name: Supervisor.Name,
    };

    req.audit.message =
      "Supervisor added successfully | تم إضافة المشرف بنجاح";

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

async function getAllSupervisors(features) {
  const { count, rows: supervisors } = await supervisor.findAndCountAll({
    ...features.options,
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

  if (!supervisors) throw new Error("not_found");

  return PaginatedResponse.fromApiFeature(
    features,
    count,
    supervisors,
    "Supervisors fetched successfully",
  );
}

// Get trainer by ID
async function getSupervisorById(id) {
  const sup = await supervisor.findByPk(id, {
    include: [
      {
        model: User,
        attributes: ["userId", "email", "role"],
        include: [
          {
            model: Permission,
            as: "permissions",
            attributes: ["permissionId", "name"],
            through: {
              attributes: [],
            },
          },
        ],
      },
    ],
  });

  if (!sup) throw new Error("Supervisor_not_found");

  return sup;
}

async function updateSupervisor(id, updateData, req) {
  const supervisorData = await supervisor.findByPk(id, {
    include: [{ model: User }],
  });

  if (!supervisorData) throw new Error("supervisor_not_found");

  const { Name, email, password, confirmPassword } = updateData;

  if (Name) supervisorData.Name = Name;

  if (email && supervisorData.User.email !== email) {
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

  req.audit.affectedUser = {
    _id: supervisorData.userId,
    email: supervisorData.User.email,
    name: supervisorData.Name,
  };

  req.audit.message =
    "Supervisor updated successfully | تم تحديث بيانات المشرف بنجاح";
  return {
    success: true,
    message: "supervisor updated successfully",
    data: supervisorData,
  };
}

async function deleteSupervisor(id, req) {
  const supervisorData = await supervisor.findByPk(id, {
    include: [{ model: User }],
  });

  if (!supervisorData) throw new Error("trainer_not_found");

  const userId = supervisorData.userId;

  await sequelize.transaction(async (t) => {
    await supervisorData.destroy({ transaction: t });
    await User.destroy({ where: { userId }, transaction: t });
  });

  req.audit.affectedUser = {
    _id: supervisorData.userId,
    email: supervisorData.User.email,
    name: supervisorData.Name,
  };

  req.audit.message =
    "Supervisor deleted successfully | تم حذف المشرف بنجاح";

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
  updateSupervisor,
};
