const { Permission, sequelize } = require("../src/models");
const { assignPermissionsToUser } = require("../src/modules/admin/usersManagment/usersServices");


const seedAllPermissionsToUser = async (userId) => {
  try {
    const allPermissions = await Permission.findAll({ attributes: ['name'] });
    const permissionNames = allPermissions.map(p => p.name);

    if (permissionNames.length === 0) {
      console.log("No permissions found in the database.");
      return;
    }
    const result = await assignPermissionsToUser(userId, permissionNames);
    console.log(`Permissions assigned successfully:`, result.assignedPermissions);
  } catch (error) {
    console.error("Error seeding permissions:", error.message);
  } finally {
    await sequelize.close();
  }
};

const userId = "5020cb8e-8e25-46b2-aa6e-67db7312781c"
if (!userId) {
  console.error("Please provide a userId. Example: node seedPermissions.js 1");
  process.exit(1);
}

seedAllPermissionsToUser(userId);
