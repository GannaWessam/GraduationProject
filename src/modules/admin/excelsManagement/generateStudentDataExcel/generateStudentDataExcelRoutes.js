const express = require('express');
const router = express.Router();
const generateStudentDataExcelController = require('./generateStudentDataExcelController');
const catchError = require('../../../../middlewares/catchError');
const { validateToken } = require('../../../../middlewares/token');

// GET /api/admin/generateStudentDataExcel/downloadSheet/:eventId
// Assumes authentication middleware exists (validateToken)
router.get(
  '/downloadSheet/:eventId',
  validateToken,
  catchError(generateStudentDataExcelController.downloadSheet)
);

module.exports = router;
