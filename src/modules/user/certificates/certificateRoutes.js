const express = require('express');
const router = express.Router();
const { validateToken } = require('../../../middlewares/token');
const certificateController = require('./certificateController');

// Student routes
router.get(
  '/my-certificates',
  validateToken,
  certificateController.getMyCertificates
);

router.get(
  '/:certificateId/download',
  validateToken,
  certificateController.downloadCertificate
);

module.exports = router;
