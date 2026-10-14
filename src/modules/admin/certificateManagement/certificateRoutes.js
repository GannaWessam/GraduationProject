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
  checkPermission('UPLOAD_CERTIFICATE'),
  uploadZip.single('file'),
  certificateController.uploadCertificates
);

router.get(
  '/jobs/:jobId',
  validateToken,
  certificateController.getJobStatus
);

router.get(
  '/jobs/:jobId/unmatched',
  validateToken,
  certificateController.getUnmatchedCertificates
);

router.get(
  '/jobs',
  validateToken,
  certificateController.getAllJobs
);

module.exports = router;
