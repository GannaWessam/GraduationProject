const express = require('express');
const router = express.Router();
const generateStudentDataExcelController = require('./generateStudentDataExcelController');
const catchError = require('../../../../middlewares/catchError');
const { validateToken } = require('../../../../middlewares/token');
const checkPermission = require('../../../../middlewares/checkPermission');

// GET /api/admin/generateStudentDataExcel/downloadSheet/:eventId
// Assumes authentication middleware exists (validateToken)
router.get(
  '/downloadSheet/:eventId',
  validateToken,
  checkPermission("DOWNLOAD_TRAINEES_FILE"),
  catchError(generateStudentDataExcelController.downloadSheet)
);

module.exports = router;
