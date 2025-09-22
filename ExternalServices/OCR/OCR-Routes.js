const express = require('express');
const router = express.Router();
const OCRService = require('./OCR-Service');

// const multer = require('multer');
// const upload = multer({ dest: 'uploads/' });
// router.post('/', upload.single('file'), OCRService.sendOcrRequest);


router.post('/', OCRService.sendOcrRequest);

module.exports = router;