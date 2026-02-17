const { User, Admin, sequelize, Permission } = require("../../../models");
const PaginatedResponse = require("../../../Util/PaginatedResponse");
const { hashPassword } = require("../../Auth/helpers/passwordHelper");
const { checkEmailExists } = require("../../Auth/helpers/userHelper");
const {
  validateName,
  validatePassword,
} = require("../../Auth/validations/registerValidation");

const logger = require("../../../Util/logger");

// --------------------- CREATE ADMIN ---------------------
async function addAdmin(AdminInfo, req) {
  const { Name, email, password, confirmPassword } = AdminInfo;
  const role = "ADMIN";

  if (!Name || !email || !password || !confirmPassword) {
    throw new Error("missing_required_fields");
  }

  validateName(Name);
  validatePassword(password, confirmPassword);

  return sequelize.transaction(async (t) => {
    await checkEmailExists(email, t);

    const hashedPassword = await hashPassword(password);

    const user = await User.create(
      { email, passwordHash: hashedPassword, role },
      { transaction: t }
    );

    const AdminData = await Admin.create(
      { userId: user.userId, Name },
      { transaction: t }
    );

    req.audit.affectedUser = {
      _id: user.userId,
      email: user.email,
      name: Name,
    };

    req.audit.message =
      "Admin created successfully | تم إنشاء المشرف بنجاح";

    return {
      success: true,
      message: "Registration completed successfully",
      data: { user, AdminData },
    };
  });
}
async function getAllAdmins(features, req) {
  const { count, rows: admins } = await Admin.findAndCountAll({
    ...features.options,
    include: [
      {
        model: User,
        attributes: ["userId", "email", "role"],
        include: [
          {
            model: Permission,
            as: "permissions",
            attributes: ["permissionId", "name"],
            through: { attributes: [] },
          },
        ],
      },
    ],
  });

  if (!admins || admins.length === 0) throw new Error("not_found");

  // req.audit.message = "Fetched all admins";

  return PaginatedResponse.fromApiFeature(
    features,
    count,
    admins,
    "admins fetched successfully"
  );
}
// --------------------- GET ADMIN BY ID ---------------------
async function getAdminById(id, req) {
  const admin = await Admin.findByPk(id, {
    include: [
      {
        model: User,
        attributes: ["userId", "email", "role"],
        include: [
          {
            model: Permission,
            as: "permissions",
            attributes: ["permissionId", "name","viewName"],
            through: { attributes: [] },
          },
        ],
      },
    ],
  });

  if (!admin) throw new Error("Admin_not_found");

  req.audit.affectedUser = {
    _id: admin.userId,
    email: admin.User.email,
    name: admin.Name,
  };

  req.audit.message =
    "Fetched admin by ID | تم جلب بيانات المشرف حسب المعرّف";

  return admin;
}

// --------------------- DELETE ADMIN ---------------------
async function deleteAdmin(id, req) {
  const admin = await Admin.findByPk(id, { include: [{ model: User }] });
  if (!admin) throw new Error("admin_not_found");

  const userId = admin.userId;

  await sequelize.transaction(async (t) => {
    await admin.destroy({ transaction: t });
    await User.destroy({ where: { userId }, transaction: t });
  });

  req.audit.affectedUser = {
    _id: userId,
    email: admin.User?.email,
    name: admin.Name,
  };

  req.audit.message =
    "Admin deleted successfully | تم حذف المشرف بنجاح";

  return {
    success: true,
    message: "Admin and related user deleted",
  };
}

async function updateAdmin(id, updateData, req) {
  const admin = await Admin.findByPk(id, { include: [{ model: User }] });
  if (!admin) throw new Error("Admin_not_found");

  const { Name, email, password, confirmPassword } = updateData;

  if (Name) admin.Name = Name;

  if (email && admin.User.email !== email) {
    await checkEmailExists(email);
    admin.User.email = email;
  }

  if (password) {
    if (!confirmPassword) throw new Error("confirmPassword_required");
    validatePassword(password, confirmPassword);
    admin.User.passwordHash = await hashPassword(password);
  }

  await sequelize.transaction(async (t) => {
    await admin.save({ transaction: t });
    await admin.User.save({ transaction: t });
  });

  req.audit.affectedUser = {
    _id: admin.userId,
    email: admin.User.email,
    name: admin.Name,
  };

  req.audit.message =
    "Admin updated successfully | تم تحديث بيانات المشرف بنجاح";

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
  updateAdmin,
};
