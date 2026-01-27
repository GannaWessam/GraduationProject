const express = require("express");
const router = express.Router();
const sessionController = require("./sessionController");
const catchError = require("../../../middlewares/catchError");
const { validateToken } = require("../../../middlewares/token");
const { uploadSessionMaterials } = require("../../../middlewares/UploadSessionMaterial");

        //*================================================================================
                                    //*TODO: Session ROUTES
        //*=================================================================================
router.get("/activeSessions",validateToken,catchError(sessionController.getUserActiveSessions));
router.post("/", validateToken, catchError(sessionController.create));
router.get("/", validateToken, catchError(sessionController.getAll));
router.get("/:id", validateToken, catchError(sessionController.getById));
router.get("/Training-Sessions/:id", validateToken, catchError(sessionController.getTrainingSessionsById));
router.get("/Event-Sessions/:id", validateToken, catchError(sessionController.getEventSessionsById));
router.put("/:id", validateToken, catchError(sessionController.update));
router.delete("/:id", validateToken, catchError(sessionController.delete));

        //*================================================================================
                                    //*TODO: Material ROUTES
        //*=================================================================================
router.get(
    "/Session/:sessionId/material",validateToken,catchError(sessionController.getSessionMaterialController)
  );
router.post(
    "/sessions/:sessionId/material",
    validateToken,
    uploadSessionMaterials,
    catchError(sessionController.uploadSessionMaterial)
);
router.delete(
    "/sessions/:mertialId/material",
    validateToken,
    catchError(sessionController.deleteMaterial)
);
router.get(
    "/sessions/:sessionId/materials/download",
    catchError(sessionController.downloadSessionMaterials)
);
router.get("/sessionQR/:sessionId", validateToken, catchError(sessionController.QRcontroller));
router.get("/session-materials/download/:materialId",catchError(sessionController.downloadSessionMaterialController));
router.get("/SessionMaterials", validateToken, catchError(sessionController.getAllSessionMaterialsController));

module.exports = router;
