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
async function addAdmin(AdminInfo, reqUser, reqIp) {
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

    // Create User
    const user = await User.create(
      { email, passwordHash: hashedPassword, role },
      { transaction: t },
    );

    // Create Admin
    const AdminData = await Admin.create(
      {
        userId: user.userId,
        Name,
      },
      { transaction: t },
    );

    // Log creation
    // reqUser is the user performing the action
    const actor = reqUser;

    console.log(actor);
    await logger.info({
      ip: reqIp,
      user: {
        _id: actor.id ,
        email: actor.email,
        name: actor.name,
      },
      type: "modification",
      level: "success",
      affectedUser: {
        _id: user.userId,
        email: user.email,
        name: Name,
      },
      message: "Admin created successfully",
    });
    return {
      success: true,
      message: "Registration completed successfully",
      data: { user, AdminData },
    };
  });
}

// --------------------- GET ALL ADMINS ---------------------
async function getAllAdmins(features, reqUser, reqIp) {
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

  // Log read
  const actor = reqUser ;
  console.log(actor);
  
  await logger.info({
    ip: reqIp,
    user: {
      _id: actor.id ||"",
      email: actor.email ,
      name: actor.name ,
    },
    type: "read",
    level: "success",
    message: "Fetched all admins",
  });

  return PaginatedResponse.fromApiFeature(
    features,
    count,
    admins,
    "admins fetched successfully",
  );
}

// --------------------- GET ADMIN BY ID ---------------------
async function getAdminById(id, reqUser, reqIp) {
  const admin = await Admin.findByPk(id, {
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

  if (!admin) throw new Error("Admin_not_found");
  const actor = reqUser ;

  // Log read
  await logger.info({
    ip: reqIp,
    user: {
      _id: actor.id ,
      email: actor.email ,
      name: actor.name ,
    },
    type: "read",
    level: "success",
    affectedUser: {
      _id: admin.userId,
      email: admin.User.email,
      name: admin.Name,
    },
    message: "Fetched admin by ID",
  });

  return admin;
}

// --------------------- DELETE ADMIN ---------------------
async function deleteAdmin(id, reqUser, reqIp) {
  const admin = await Admin.findByPk(id);

  if (!admin) throw new Error("admin_not_found");

  const userId = admin.userId;

  await sequelize.transaction(async (t) => {
    await admin.destroy({ transaction: t });
    await User.destroy({ where: { userId }, transaction: t });
  });

  // Log deletion
  const actor = reqUser;
  await logger.info({
    ip: reqIp,
    user: {
      _id: actor.id ,
      email: actor.email ,
      name: actor.name ,
    },
    type: "delete",
    level: "success",
    affectedUser: {
      _id: userId,
      email: admin.User?.email ,
      name: admin.Name,
    },
    message: "Admin deleted successfully",
  });


  return {
    success: true,
    message: "Admin and related user deleted",
  };
}

// --------------------- UPDATE ADMIN ---------------------
async function updateAdmin(id, updateData, reqUser, reqIp) {
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
    const hashed = await hashPassword(password);
    admin.User.passwordHash = hashed;
  }

  await sequelize.transaction(async (t) => {
    await admin.save({ transaction: t });
    await admin.User.save({ transaction: t });
  });

  // Log update
  const actor = reqUser ;
  await logger.info({
    ip: reqIp,
    user: {
      _id: actor.id ,
      email: actor.email ,
      name: actor.name ,
    },
    type: "modification",
    level: "success",
    affectedUser: {
      _id: admin.userId,
      email: admin.User.email,
      name: admin.Name,
    },
    message: "Admin updated successfully",
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
  updateAdmin,
};
