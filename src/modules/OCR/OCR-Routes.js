const { ocrController } = require("./OCR-Controller");
const express = require('express');


const router = express.Router();

router.post("/ocr", ocrController);

module.exports= router