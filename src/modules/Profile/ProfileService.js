const { Profile, Permission, ProfilePermission } = require("../../models");
const PaginatedResponse = require("../../Util/PaginatedResponse");
const ApiFeature = require("../../Util/ApiFeatures");

async function getAllProfilesService(reqQuery = {}) {
  const apiFeature = new ApiFeature(reqQuery)
    .pagination()
    .filter()
    .sort()
    .selectedFields()
    .search();

  const profiles = await Profile.findAll({
    ...apiFeature.options,
    include: [
      {
        model: Permission,
        as: "permissions",
        through: { attributes: [] }, // exclude join table data
      },
    ],
  });

  const total = await Profile.count();

  return PaginatedResponse.fromApiFeature(
    apiFeature,
    total,
    profiles,
    "Profiles fetched successfully"
  );
}

async function addProfile(profileInfo) {
  const { name, permissionIds = [] } = profileInfo;

  if (!name) throw new Error("missing_required");

  const exists = await Profile.findOne({ where: { name } });
  if (exists) throw new Error("profile_exists");

  const profile = await Profile.create({ name });

  // Assign permissions if provided
  if (permissionIds.length) {
    await profile.setPermissions(permissionIds);
  }

  // Fetch with permissions
  return await Profile.findByPk(profile.profileId, {
    include: [{ model: Permission, as: "permissions", through: { attributes: [] } }],
  });
}

async function getProfileById(id) {
  const profile = await Profile.findByPk(id, {
    include: [{ model: Permission, as: "permissions", through: { attributes: [] } }],
  });

  if (!profile) throw new Error("not_found");

  return profile;
}

async function updateProfile(id, updateInfo) {
  const { name, permissionIds } = updateInfo;

  const profile = await Profile.findByPk(id);
  if (!profile) throw new Error("not_found");

  if (name) profile.name = name;
  await profile.save();

  // Update permissions if provided
  if (Array.isArray(permissionIds)) {
    await profile.setPermissions(permissionIds);
  }

  return await Profile.findByPk(profile.profileId, {
    include: [{ model: Permission, as: "permissions", through: { attributes: [] } }],
  });
}

async function deleteProfile(id) {
  const profile = await Profile.findByPk(id);
  if (!profile) throw new Error("not_found");

  await profile.destroy();
  return { deleted: true };
}

module.exports = {
  getAllProfilesService,
  addProfile,
  getProfileById,
  updateProfile,
  deleteProfile,
};
