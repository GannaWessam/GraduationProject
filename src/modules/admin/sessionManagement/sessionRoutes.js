const express = require("express");
const router = express.Router();
const sessionController = require("./sessionController");
const catchError = require("../../../middlewares/catchError");
const { validateToken } = require("../../../middlewares/token");
const { uploadSessionMaterials } = require("../../../middlewares/UploadSessionMaterial");

router.get("/activeSessions",validateToken,catchError(sessionController.getUserActiveSessions));
router.post("/", validateToken, catchError(sessionController.create));
router.get("/", validateToken, catchError(sessionController.getAll));
router.get("/:id", validateToken, catchError(sessionController.getById));
router.get("/Training-Sessions/:id", validateToken, catchError(sessionController.getTrainingSessionsById));
router.get("/Event-Sessions/:id", validateToken, catchError(sessionController.getEventSessionsById));
router.put("/:id", validateToken, catchError(sessionController.update));
router.delete("/:id", validateToken, catchError(sessionController.delete));
router.post(
    "/sessions/:sessionId/material",
    uploadSessionMaterials,
    catchError(sessionController.uploadSessionMaterial)
);

router.get(
    "/sessions/:sessionId/materials/download",
    catchError(sessionController.downloadSessionMaterials)
);

module.exports = router;
