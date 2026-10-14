const express = require('express');
const router = express.Router();
const { validateToken } = require('../../../middlewares/token');
const checkPermission = require('../../../middlewares/checkPermission');
const certificateController = require('./certificateController');
const { uploadZip } = require('./helpers/uploadMiddleware');

// Routes
router.post(
  '/upload',
  validateToken,
  uploadZip.single('file'),
  certificateController.uploadCertificates
);

router.get(
  '/jobs/:jobId',
  validateToken,
  certificateController.getJobStatus
);

router.get(
  '/jobs',
  validateToken,
  certificateController.getAllJobs
);

module.exports = router;
