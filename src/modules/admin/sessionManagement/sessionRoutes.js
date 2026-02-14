const express = require("express");
const router = express.Router();
const sessionController = require("./sessionController");
const catchError = require("../../../middlewares/catchError");
const { validateToken } = require("../../../middlewares/token");
const { uploadSessionMaterials } = require("../../../middlewares/UploadSessionMaterial");
const checkPermission = require("../../../middlewares/checkPermission");

        //*================================================================================
                                    //*TODO: Session ROUTES
        //*=================================================================================
router.get(
  "/activeSessions",
  validateToken,
  // checkPermission("getSessions"),
  catchError(sessionController.getUserActiveSessions)
);
router.post(
  "/",
  validateToken,
  // checkPermission("createSession"),
  catchError(sessionController.create)
);
router.get(
  "/",
  validateToken,
  // checkPermission("getSessions"),
  catchError(sessionController.getAll)
);
router.get(
  "/:id",
  validateToken,
  // checkPermission("getSession"),
  catchError(sessionController.getById)
);
router.get(
  "/Training-Sessions/:id",
  validateToken,
  // checkPermission("getSession"),
  catchError(sessionController.getTrainingSessionsById)
);
router.get(
  "/Event-Sessions/:id",
  validateToken,
  // checkPermission("getSession"),
  catchError(sessionController.getEventSessionsById)
);
router.put(
  "/:id",
  validateToken,
  // checkPermission("updateSession"),
  catchError(sessionController.update)
);
router.delete(
  "/:id",
  validateToken,
  // checkPermission("deleteSession"),
  catchError(sessionController.delete)
);

        //*================================================================================
                                    //*TODO: Material ROUTES
        //*=================================================================================
router.get(
  "/Session/:sessionId/material",
  validateToken,
  // checkPermission("getSession"),
  catchError(sessionController.getSessionMaterialController)
);
router.post(
  "/sessions/:sessionId/material",
  validateToken,
  // checkPermission("createSession"),
  uploadSessionMaterials,
  catchError(sessionController.uploadSessionMaterial)
);
router.delete(
  "/sessions/:mertialId/material",
  validateToken,
  // checkPermission("deleteSession"),
  catchError(sessionController.deleteMaterial)
);
router.get(
  "/sessions/:sessionId/materials/download",
  validateToken,
  // checkPermission("getSession"),
  catchError(sessionController.downloadSessionMaterials)
);
router.get(
  "/sessionQR/:sessionId",
  validateToken,
  // checkPermission("getSession"),
  catchError(sessionController.QRcontroller)
);
router.get(
  "/session-materials/download/:materialId",
  validateToken,
  // checkPermission("getSession"),
  catchError(sessionController.downloadSessionMaterialController)
);
router.get(
  "/SessionMaterials",
  validateToken,
  // checkPermission("getSessions"),
  catchError(sessionController.getAllSessionMaterialsController)
);

module.exports = router;
