const sessionService = require("./sessionServices");
const ApiFeature = require("../../../Util/ApiFeatures");
const ApiResponse = require("../../../Util/ApiResponse");

const sessionController = {
  async create(req, res) {
    const session = await sessionService.createSession(req.body);
    res.status(201).json(ApiResponse.success(session));
  },

  async getAll(req, res) {
    const features = new ApiFeature(req.query)
      .filter()
      .search()
      .sort()
      .pagination()
      .selectedFields();

    const sessions = await sessionService.getAllSessions(features);
    res.status(200).json(ApiResponse.success(sessions));
  },

  async getById(req, res) {
    const session = await sessionService.getSessionById(req.params.id);
    res.status(200).json(ApiResponse.success(session));
  },

  async update(req, res) {
    const session = await sessionService.updateSession(req.params.id, req.body);
    res.status(200).json(ApiResponse.success(session));
  },

  async delete(req, res) {
    const result = await sessionService.deleteSession(req.params.id);
    res.status(200).json(ApiResponse.success(result));
  },
};

module.exports = sessionController;
