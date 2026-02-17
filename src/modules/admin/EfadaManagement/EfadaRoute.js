// const express = require("express");
// const router = express.Router();
// const efadaController = require("../EfadaManagement/EfadaController");

// router.get("/efada", efadaController.generateEfada);

// module.exports = router;
const express = require('express');
const { validateToken } = require("../../../middlewares/token");
const router = express.Router();
const efadaController = require('./EfadaController');

// GET all efadas
router.get('/', efadaController.getAllEfadas);
router.post('/',validateToken,efadaController.addEfada);

module.exports = router;
