// const express = require("express");
// const router = express.Router();
// const efadaController = require("../EfadaManagement/EfadaController");

// router.get("/efada", efadaController.generateEfada);

// module.exports = router;
const express = require('express');
const { validateToken } = require("../../../middlewares/token");
const router = express.Router();
const efadaController = require('./EfadaController');
const checkPermission = require('../../../middlewares/checkPermission');
const catchError = require('../../../middlewares/catchError');

// GET all efadas
router.get('/',validateToken,checkPermission("VIEW_STATEMENTS") ,catchError(efadaController.getAllEfadas));
router.post('/',validateToken,catchError(efadaController.addEfada));
router.post("/efada",validateToken,checkPermission("GENERATE_STATEMENTS") ,catchError(efadaController.generateEfada));
router.post("/efada/word",validateToken,catchError(efadaController.generateEfadaDOCX));
// router.post("/efada/word" ,efadaController.generateWord);

module.exports = router;
