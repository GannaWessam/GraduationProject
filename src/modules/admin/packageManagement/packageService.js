// services/package.service.js
const { Error } = require("sequelize");
const { package: Package, Product, course: Course, packageProduct, packageCourse, sequelize } = require("../../../models/index.js");
const PaginatedResponse = require("../../../Util/PaginatedResponse");

const packageService = {
  async createPackage(data) {
    const { packageName, size, courseIds } = data;

    if(!packageName || !size)
        throw new Error("packageName and size are required")
    return sequelize.transaction(async (t) => {
      const newPackage = await Package.create(
        { packageName, size },
        { transaction: t }
      );
      if (courseIds?.length) {
        const packageCourses = courseIds.map((courseId) => ({
          packageId: newPackage.packageId,
          courseId,
        }));
        await packageCourse.bulkCreate(packageCourses, { transaction: t });
      }else
        throw new Error("course_id_is_null");

      return newPackage;
    });
  },

  // Get all packages
  async getAllPackages(features) {
    const {count, rows:packages} = await Package.findAndCountAll({
      ...features.options,
      distinct: true,
      include: [
        { model: Course, through: { attributes: [] } },
      ],
    });
    return PaginatedResponse.fromApiFeature(
        features,
        count,
        packages,
        "Packages fetched successfully"
      );
  },

  // Get package by ID
  async getPackageById(packageId) {
    const pkg = await Package.findByPk(packageId, {
      include: [
        { model: Course, through: { attributes: [] } }, //ht7otly array of courses
      ],
    });
    if (!pkg) throw new Error("package_not_found");
    return pkg;
  },

  // Update package
  async updatePackage(packageId, data) {
    const { packageName, size, courseIds } = data;

    return sequelize.transaction(async (t) => {
      const pkg = await Package.findByPk(packageId, { transaction: t });
      if (!pkg) throw new Error("package_not_found");

      if(packageName || size)
        await pkg.update({ packageName, size }, { transaction: t });
      if (courseIds) {
        try {
          await packageCourse.destroy({ where: { packageId }, transaction: t });
      
          const newLinks = courseIds.map((courseId) => ({ packageId, courseId }));
          await packageCourse.bulkCreate(newLinks, { transaction: t });
        } catch (error) {
          if (error.name === 'SequelizeForeignKeyConstraintError') {
            throw new Error('Please enter existing and valid course IDs.');
          }
          throw error;
        }
      }
      

      return pkg;
    });
  },

  // Delete package
  async deletePackage(packageId) {
    return sequelize.transaction(async (t) => {
      const pkg = await Package.findByPk(packageId, { transaction: t });
      if (!pkg) throw new Error("package_not_found");
      await packageCourse.destroy({ where: { packageId }, transaction: t });
      await pkg.destroy({ transaction: t });

      return { message: "Package deleted successfully" };
    });
  },
};

module.exports = packageService;
