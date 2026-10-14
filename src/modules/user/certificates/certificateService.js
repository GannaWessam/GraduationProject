const { UserCertificate } = require('../../../models');
const fs = require('fs');

/**
 * Get all certificates for a student
 */
async function getStudentCertificates(userId) {
  const certificates = await UserCertificate.findAll({
    where: { userId },
    attributes: [
      'certificateId',
      'fileName',
      'certificatePath',
      'uploadBatch',
      'createdAt',
      'updatedAt'
    ],
    order: [['createdAt', 'DESC']]
  });

  return certificates;
}

/**
 * Download certificate (verify ownership)
 */
async function downloadCertificate(certificateId, userId) {
  // Find certificate and verify ownership
  const certificate = await UserCertificate.findOne({
    where: {
      certificateId,
      userId
    }
  });

  if (!certificate) {
    const error = new Error('Certificate not found or access denied');
    error.statusCode = 404;
    throw error;
  }

  // Get file path (remove HOST_BACK prefix if present)
  let filePath = certificate.certificatePath;
  if (filePath.startsWith('http')) {
    // Extract just the path part
    const url = new URL(filePath);
    filePath = url.pathname.substring(1); // Remove leading /
  }

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    const error = new Error('Certificate file not found on server');
    error.statusCode = 404;
    throw error;
  }

  return filePath;
}

module.exports = {
  getStudentCertificates,
  downloadCertificate
};
