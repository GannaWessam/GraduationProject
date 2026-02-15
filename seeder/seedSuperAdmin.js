/**
 * Seed one Super Admin.
 * Usage: node seeder/seedSuperAdmin.js
 */
require("dotenv").config();
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const { sequelize, User, SuperAdmin } = require("../src/models");

const SUPERADMIN = {
  email: "ganawesam82@gmail.com",
  password: "Password123!",
  name: "Super Admin",
};

async function seedSuperAdmin() {
  try {
    await sequelize.authenticate();
    console.log("DB Connected...");

    const [user, userCreated] = await User.findOrCreate({
      where: { email: SUPERADMIN.email },
      defaults: {
        userId: uuidv4(),
        email: SUPERADMIN.email,
        passwordHash: await bcrypt.hash(SUPERADMIN.password.trim(), 12),
        role: "SUPERADMIN",
      },
    });

    const [superAdmin, superAdminCreated] = await SuperAdmin.findOrCreate({
      where: { userId: user.userId },
      defaults: {
        userId: user.userId,
        Name: SUPERADMIN.name,
      },
    });

    if (userCreated || superAdminCreated) {
      console.log("✅ Super Admin seeded:", SUPERADMIN.email);
    } else {
      console.log("✅ Super Admin already exists:", SUPERADMIN.email);
    }
  } catch (err) {
    console.error("❌", err);
    throw err;
  } finally {
    await sequelize.close();
  }
}

seedSuperAdmin().then(() => process.exit(0)).catch(() => process.exit(1));
