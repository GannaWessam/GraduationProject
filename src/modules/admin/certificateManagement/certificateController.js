const certificateService = require('./certificateService');

/**
 * Upload certificates ZIP file
 */
async function uploadCertificates(req, res) {
  try {
    const file = req.file;
    const adminUserId = req.userData.id;

    const result = await certificateService.handleCertificateUpload(
      file,
      adminUserId
    );

    return res.status(202).json({
      success: true,
      jobId: result.jobId,
      message: 'Upload received, processing started',
      data: result
    });

  } catch (error) {
    console.error('Upload controller error:', error);
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Get job status by jobId
 */
async function getJobStatus(req, res) {
  try {
    const { jobId } = req.params;

    const job = await certificateService.getJobStatus(jobId);

    return res.status(200).json({
      success: true,
      data: job
    });

  } catch (error) {
    console.error('Get job status error:', error);
    return res.status(404).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Get all upload jobs
 */
async function getAllJobs(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await certificateService.getAllJobs(page, limit);

    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Get all jobs error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Get unmatched certificates for a specific job
 */
async function getUnmatchedCertificates(req, res) {
  try {
    const { jobId } = req.params;

    const result = await certificateService.getUnmatchedCertificates(jobId);

    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Get unmatched certificates error:', error);
    return res.status(404).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {
  uploadCertificates,
  getJobStatus,
  getAllJobs,
  getUnmatchedCertificates
};
