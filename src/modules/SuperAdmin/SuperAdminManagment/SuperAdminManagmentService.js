const { User, SuperAdmin, sequelize } = require("../../../models");

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

    req.audit.message = "SuperAdmin Added successfully";
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
      },
    ],
  });

  if (!sup) throw new Error("SuperAdmin_not_found");

  return sup;
}

module.exports = {
  addSuperAdmin,
  getAllSuperAdmins,
  getSuperAdminById,
};
