const { User, SuperAdmin, sequelize, Permission } = require("../../../models");

const { hashPassword } = require("../../Auth/helpers/passwordHelper");
const { checkEmailExists } = require("../../Auth/helpers/userHelper");
const {
  validateName,
  validatePassword,
} = require("../../Auth/validations/registerValidation");

async function addSuperAdmin(SuperAdminInfo, req) {
  const { Name, email, password, confirmPassword } = SuperAdminInfo;
  const role = "SUPERADMIN";

  if (!Name || !email || !password || !confirmPassword) {
    throw new Error("missing_required_fields");
  }

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

    // ✅ Create SuperAdmin
    const SuperAdminData = await SuperAdmin.create(
      {
        userId: user.userId,
        Name: Name,
      },
      { transaction: t },
    );
    // ✅ Return the formatted response

    req.audit.affectedUser = {
      _id: SuperAdminData.userId,
      email: user.email,
      name: SuperAdminData.Name,
    };

    req.audit.message =
      "Super admin added successfully | تم إضافة المدير الأعلى للنظام بنجاح";
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
        attributes: ["userId", "email", "role"],
      },
    ],
  });
}

// Get SuperAdmin by ID
async function getSuperAdminById(id) {
  const sup = await SuperAdmin.findByPk(id, {
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

  if (!sup) throw new Error("SuperAdmin_not_found");

  return sup;
}

async function updateSuperAdmin(id, updateData, req) {
  const superAdminData = await SuperAdmin.findByPk(id, {
    include: [{ model: User }],
  });

  if (!superAdminData) throw new Error("supervisor_not_found");

  const { Name, email, password, confirmPassword } = updateData;

  if (Name) superAdminData.Name = Name;

  if (email && superAdminData.User.email !== email) {
    await checkEmailExists(email);
    superAdminData.User.email = email;
  }

  if (password) {
    if (!confirmPassword) {
      throw new Error("confirmPassword_required");
    }

    validatePassword(password, confirmPassword);

    const hashed = await hashPassword(password);
    superAdminData.User.passwordHash = hashed;
  }

  // Save both SuperAdmin + User in transaction
  await sequelize.transaction(async (t) => {
    await superAdminData.save({ transaction: t });
    await superAdminData.User.save({ transaction: t });
  });

  req.audit.affectedUser = {
    _id: superAdminData.userId,
    email: superAdminData.User.email,
    name: superAdminData.Name,
  };

  req.audit.message =
    "Superadmin updated successfully | تم تحديث بيانات المسؤول بنجاح";
  return {
    success: true,
    message: "superadmin updated successfully",
    data: superAdminData,
  };
}

module.exports = {
  addSuperAdmin,
  getAllSuperAdmins,
  getSuperAdminById,
  updateSuperAdmin
};
