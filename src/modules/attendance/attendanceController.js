const attendanceService = require("./attendanceService");
const ApiResponse = require("../../Util/ApiResponse");
const ApiFeature = require("../../Util/ApiFeatures");

const attendanceController = {

  async create(req, res) {
    const userId =  req.userData.id;
    const attendance = await attendanceService.createAttendance(
      userId,
      req.params.sessionId,
      req
    );

    res.status(201).json(ApiResponse.success(attendance));
  },

  async getAll(req, res) {
    const features = new ApiFeature(req.query)
      .filter()
      .search()
      .sort()
      .pagination()
      .selectedFields();

    const data = await attendanceService.getAllAttendance(features);
    res.status(200).json(ApiResponse.success(data));
  },

  async getById(req, res) {
    const data = await attendanceService.getAttendanceById(req.params.id);
    res.json(ApiResponse.success(data));
  },

  async getBySession(req, res) {
    const features = new ApiFeature(req.query)
      .filter()
      .search()
      .sort()
      .pagination()
      .selectedFields();
    const data = await attendanceService.getAttendanceBySession(
      req.params.sessionId,features
    );
    res.json(ApiResponse.success(data));
  },

  async getByUser(req, res) {
    const features = new ApiFeature(req.query)
      .filter()
      .search()
      .sort()
      .pagination()
      .selectedFields();
    const data = await attendanceService.getAttendanceByUser(
      req.userData.id,features
    );
    res.json(ApiResponse.success(data));
  },


  async delete(req, res) {
    const data = await attendanceService.deleteAttendance(req.params.id, req);
    res.json(ApiResponse.success(data));
  },
};

module.exports = attendanceController;