const sessionService = require("./sessionServices");
const ApiFeature = require("../../../Util/ApiFeatures");
const ApiResponse = require("../../../Util/ApiResponse");

const sessionController = {
  async create(req, res) {
    const session = await sessionService.createSession(req.body, req);
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

  async getTrainingSessionsById(req, res) {
    const session = await sessionService.getSessionByTrainingId(req.params.id);
    res.status(200).json(ApiResponse.success(session));
  },

  async getEventSessionsById(req, res) {
    const session = await sessionService.getSessionsByEventId(req.params.id);
    res.status(200).json(ApiResponse.success(session));
  },

  async update(req, res) {
    const session = await sessionService.updateSession(
      req.params.id,
      req.body,
      req
    );
    res.status(200).json(ApiResponse.success(session));
  },

  async delete(req, res ,next) {
    try {
      const { materialId } = req.params;
      const result = await sessionService.deleteSessionMaterial(materialId, req);
  
      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getUserActiveSessions(req, res, next) {
    try {
      const userId =req.userData.id;
      const data = await sessionService.getUserActiveSessions(userId);
      res.json(data);
    } catch (error) {
      return next(error);
    }
  },

  async uploadSessionMaterial(req, res, next) {
    try {
      const { sessionId } = req.params;
      const files = req.files["materials"]; 
  
      const result = await sessionService.uploadSessionMaterialService(
        sessionId,
        files,
        req
      );
  
      res.status(200).json({
        status: "success",
        message: "Session materials uploaded successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }},

    async deleteMaterial(req, res) {
      const result = await sessionService.deleteSessionMaterial(req.params.mertialId);
      res.status(200).json(ApiResponse.success(result));
    },

  async downloadSessionMaterials(req, res, next) {
      try {
        const { sessionId } = req.params;
        await sessionService.downloadSessionMaterialsService(sessionId, res);
      } catch (error) {
        next(error);
      }},
  async QRcontroller(req, res,next) {
    try {
      const { sessionId } = req.params;

      const QR = await sessionService.QRservice(sessionId);
        
      res.status(200).json(ApiResponse.success(QR));

      } catch (error) {
        next(error);
      }
  },

  async QRforEFadaController(req, res,next) {
    try {
      const { userId } = req.params;
      const QR = await sessionService.QRforEFada(userId);
      res.status(200).json(ApiResponse.success(QR));
    } catch (error) {
      next(error);
    }
  },

  async getSessionMaterialController(req, res , next) {
    try {
        const features = new ApiFeature(req.query)
          .filter()
          .search()
          .sort()
          .pagination()
          .selectedFields();

        const { sessionId } = req.params;
    
        const sessions = await sessionService.getSessionMaterialService(sessionId ,features);
        res.status(200).json(ApiResponse.success(sessions));
      } catch (error) {
        next(error);
      }
  },

  async getAllSessionMaterialsController(req, res , next) {
    try {
    const features = new ApiFeature(req.query)
      .filter()
      .search()
      .sort()
      .pagination()
      .selectedFields();

    const sessions = await sessionService.getAllSessionsMaterials(features);
    res.status(200).json(ApiResponse.success(sessions));
  } catch (error) {
    next(error);
  }
  }, 
  async downloadSessionMaterialController(req, res, next) {
    try {
      const { materialId } = req.params;

      const { filePath, fileName } =
        await sessionService.downloadSessionMaterial(materialId);

      res.download(filePath, fileName);
    } catch (error) {
      next(error);
    }
  },
  async exportAttendanceExcel(req, res, next) {
    try {
      const { sessionId,lang } = req.params;
      if (!sessionId) {
        return res.status(400).json(
          ApiResponse.error("sessionId is required")
        );
      }
  
      await sessionService.exportSessionAttendanceExcel(sessionId, res,lang);
  
    } catch (error) {
      next(error);
    }
  }
};

module.exports = sessionController;
