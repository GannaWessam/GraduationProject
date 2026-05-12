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

// GET all efadas
router.get('/',validateToken,checkPermission("VIEW_STATEMENTS") ,efadaController.getAllEfadas);
router.post('/',validateToken,efadaController.addEfada);
router.post("/efada",validateToken,checkPermission("GENERATE_STATEMENTS") ,efadaController.generateEfada);
router.post("/efada/word" ,efadaController.generateWord);

module.exports = router;
