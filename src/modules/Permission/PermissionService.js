// const { Permission } = require("../../models");
// const PaginatedResponse = require("../../Util/PaginatedResponse");
// const ApiFeature = require("../../Util/ApiFeatures");

// async function getAllPermissionsService(reqQuery = {}) {
//   const apiFeature = new ApiFeature(reqQuery)
//     .pagination()
//     .filter()
//     .sort()
//     .selectedFields()
//     .search();

//   const permissions = await Permission.findAll(apiFeature.options);
//   const total = await Permission.count();

//   return PaginatedResponse.fromApiFeature(
//     apiFeature,
//     total,
//     permissions,
//     "Permissions fetched successfully"
//   );
// }

// async function addPermission(permissionInfo) {
//   const { name } = permissionInfo;

//   if (!name) throw new Error("missing_required");

//   const exists = await Permission.findOne({ where: { name } });
//   if (exists) throw new Error("permission_exists");

//   const permission = await Permission.create({ name });
//   return permission;
// }

// async function getPermissionById(id) {
//   const permission = await Permission.findByPk(id);
//   if (!permission) throw new Error("not_found");
//   return permission;
// }

// async function updatePermission(id, updateInfo) {
//   const { name } = updateInfo;

//   const permission = await Permission.findByPk(id);
//   if (!permission) throw new Error("not_found");

//   if (name) permission.name = name;

//   await permission.save();
//   return permission;
// }

// async function deletePermission(id) {
//   const permission = await Permission.findByPk(id);
//   if (!permission) throw new Error("not_found");

//   await permission.destroy();
//   return { deleted: true };
// }

// async function seedPermissions(permissionNames = []) {
//   if (!Array.isArray(permissionNames) || permissionNames.length === 0) {
//     throw new Error("invalid_permissions_array");
//   }

//   // Normalize (trim + uppercase)
//   const normalized = permissionNames.map((p) => p.trim().toUpperCase());

//   // Find existing permissions
//   const existing = await Permission.findAll({
//     where: { name: normalized },
//     attributes: ["name"],
//   });

//   const existingNames = existing.map((p) => p.name);

//   // Filter only new permissions
//   const toCreate = normalized
//     .filter((name) => !existingNames.includes(name))
//     .map((name) => ({ name }));

//   if (toCreate.length === 0) {
//     return {
//       created: 0,
//       message: "All permissions already exist",
//     };
//   }

//   await Permission.bulkCreate(toCreate);

//   return {
//     created: toCreate.length,
//     permissions: toCreate.map((p) => p.name),
//   };
// }

// module.exports = {
//   addPermission,
//   getAllPermissionsService,
//   getPermissionById,
//   updatePermission,
//   deletePermission,
//   seedPermissions
// };



const { Permission, Container } = require("../../models");
const PaginatedResponse = require("../../Util/PaginatedResponse");
const ApiFeature = require("../../Util/ApiFeatures");


async function getAllPermissionsService(reqQuery = {}) {
  const apiFeature = new ApiFeature(reqQuery)
    .pagination()
    .filter()
    .sort()
    .selectedFields()
    .search();

  const permissions = await Permission.findAll({
    ...apiFeature.options,
    include: [
      {
        model: Container,
        as: "container",
        attributes: ["containerId", "name", "description"],
      },
    ],
  });

  const total = await Permission.count();

  return PaginatedResponse.fromApiFeature(
    apiFeature,
    total,
    permissions,
    "Permissions fetched successfully"
  );
}


async function addPermission(permissionInfo) {
  const { name, containerId } = permissionInfo;

  if (!name) throw new Error("missing_required");

  const exists = await Permission.findOne({ where: { name } });
  if (exists) throw new Error("permission_exists");

  const permission = await Permission.create({ name, containerId });
  return permission;
}


async function getPermissionById(id) {
  const permission = await Permission.findByPk(id, {
    include: [
      {
        model: Container,
        as: "container",
        attributes: ["containerId", "name", "description"],
      },
    ],
  });
  if (!permission) throw new Error("not_found");
  return permission;
}


async function updatePermission(id, updateInfo) {
  const { name, containerId } = updateInfo;

  const permission = await Permission.findByPk(id);
  if (!permission) throw new Error("not_found");

  if (name) permission.name = name;
  if (containerId !== undefined) permission.containerId = containerId;

  await permission.save();
  return permission;
}


async function deletePermission(id) {
  const permission = await Permission.findByPk(id);
  if (!permission) throw new Error("not_found");

  await permission.destroy();
  return { deleted: true };
}


async function seedPermissions(permissionArray = []) {
  if (!Array.isArray(permissionArray) || permissionArray.length === 0) {
    throw new Error("invalid_permissions_array");
  }

  const normalized = permissionArray.map((p) => ({
    name: p.name.trim().toUpperCase(),
    containerId: p.containerId || null,
    viewName:p.viewName || null
  }));

  const existing = await Permission.findAll({
    where: { name: normalized.map((p) => p.name) },
    attributes: ["name"],
  });

  const existingNames = existing.map((p) => p.name);

  const toCreate = normalized.filter((p) => !existingNames.includes(p.name));

  if (toCreate.length === 0) {
    return {
      created: 0,
      message: "All permissions already exist",
    };
  }

  await Permission.bulkCreate(toCreate);

  return {
    created: toCreate.length,
    permissions: toCreate.map((p) => p.name),
  };
}

module.exports = {
  addPermission,
  getAllPermissionsService,
  getPermissionById,
  updatePermission,
  deletePermission,
  seedPermissions,
};
