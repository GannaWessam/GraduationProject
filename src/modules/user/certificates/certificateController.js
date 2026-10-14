const certificateService = require('./certificateService');

/**
 * Get all certificates for logged-in student
 */
async function getMyCertificates(req, res) {
  try {
    const userId = req.userData.id;

    const certificates = await certificateService.getStudentCertificates(userId);

    return res.status(200).json({
      success: true,
      data: certificates
    });

  } catch (error) {
    console.error('Get certificates error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Download specific certificate
 */
async function downloadCertificate(req, res) {
  try {
    const { certificateId } = req.params;
    const userId = req.userData.id;

    const filePath = await certificateService.downloadCertificate(certificateId, userId);

    // Send file
    return res.download(filePath, (err) => {
      if (err) {
        console.error('Download error:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to download certificate'
        });
      }
    });

  } catch (error) {
    console.error('Download certificate error:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {
  getMyCertificates,
  downloadCertificate
};
