// controllers/package.controller.js
const packageService = require("./packageService");
const ApiFeature = require("../../../Util/ApiFeatures");
const ApiResponse = require("../../../Util/ApiResponse");

const packageController = {
  async create(req, res) {
      const pkg = await packageService.createPackage(req.body);
      res.status(201).json(ApiResponse.success(pkg));
  },

  async getAll(req, res) {
    const features = new ApiFeature(req.query)
    .filter()
    .search()
    .sort()
    .pagination()
    .selectedFields();
    const packages = await packageService.getAllPackages(features);
    res.status(200).json(ApiResponse.success(packages));
  },

  async getById(req, res) {
      const pkg = await packageService.getPackageById(req.params.id);
      res.status(200).json(ApiResponse.success(pkg));
  },

  async update(req, res) {
      const pkg = await packageService.updatePackage(req.params.id, req.body);
      res.status(200).json(ApiResponse.success(pkg));
  },

  async delete(req, res, next) {
      const result = await packageService.deletePackage(req.params.id);
      res.status(200).json(ApiResponse.success(result));
  },
};

module.exports = packageController;
