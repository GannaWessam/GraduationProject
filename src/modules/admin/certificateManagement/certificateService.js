const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const { CertificateUploadJob, UserCertificate, Student } = require('../../../models');
const WebSocketService = require('../../../Services/WebSocket');
const { extractNameFromFileName } = require('./helpers/nameExtractor');

/**
 * Handle certificate upload - creates job and triggers processing
 */
async function handleCertificateUpload(file, adminUserId) {
  // Validate file
  if (!file) {
    throw new Error('No file provided');
  }

  const fileExt = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
  if (fileExt !== '.zip' && fileExt !== '.rar') {
    throw new Error('Only ZIP and RAR files are allowed');
  }

  // Generate jobId
  const jobId = uuidv4();

  // Ensure temp directory exists
  const tempDir = 'uploads/temp/certificates';
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  // Define permanent temp path (keep original extension)
  const tempPath = path.join(tempDir, `${jobId}${fileExt}`);

  // Move uploaded file to permanent temp location
  await fs.promises.rename(file.path, tempPath);

  // Create job record
  const job = await CertificateUploadJob.create({
    jobId: jobId,
    uploadedBy: adminUserId,
    fileName: file.originalname,
    fileSize: file.size,
    status: 'uploading'
  });

  // Trigger background processing (fire and forget)
  processCertificateUpload(jobId, tempPath, adminUserId)
    .catch(err => {
      console.error('Background processing error for job', jobId, ':', err);
    });

  return {
    jobId: jobId,
    fileName: file.originalname,
    fileSize: file.size
  };
}

/**
 * Background processing of certificate upload
 */
async function processCertificateUpload(jobId, archivePath, adminUserId) {
  const { extractAndScanZip, cleanupExtraction, deleteZipFile } = require('./helpers/zipExtractor');
  const { processCertificateFiles } = require('./helpers/fileProcessor');

  let extractPath = null;
  let lastProgressUpdate = Date.now();

  try {
    // Update status to processing
    await CertificateUploadJob.update(
      { status: 'processing' },
      { where: { jobId } }
    );

    // Send WebSocket notification - started
    WebSocketService.notifyUploadProgress(adminUserId, jobId, {
      type: 'started',
      message: 'Processing started...',
      progress: 0
    });

    console.log(`[Job ${jobId}] Processing started`);

    // Phase 1: Extract archive and scan for PDFs
    WebSocketService.notifyUploadProgress(adminUserId, jobId, {
      type: 'extracting',
      message: 'Extracting archive file...',
      progress: 5
    });

    const { extractPath: extracted, pdfFiles } = await extractAndScanZip(archivePath, jobId);
    extractPath = extracted;

    console.log(`[Job ${jobId}] Found ${pdfFiles.length} PDF files`);

    // Update job with total files
    await CertificateUploadJob.update(
      { totalFiles: pdfFiles.length },
      { where: { jobId } }
    );

    // Send WebSocket notification - found files
    WebSocketService.notifyUploadProgress(adminUserId, jobId, {
      type: 'processing',
      message: `Found ${pdfFiles.length} certificates, starting processing...`,
      progress: 10,
      totalFiles: pdfFiles.length,
      processedFiles: 0,
      matchedCount: 0,
      notMatchedCount: 0
    });

    // Phase 2: Process all PDF files
    const results = await processCertificateFiles(pdfFiles, null, async (progressData) => {
      // Update job in database
      await CertificateUploadJob.update(
        {
          processedFiles: progressData.processedFiles,
          matchedCount: progressData.matchedCount,
          notMatchedCount: progressData.notMatchedCount,
          currentFile: progressData.currentFile
        },
        { where: { jobId } }
      );

      // Throttle WebSocket updates (every 2 seconds or every 5 files)
      const now = Date.now();
      const shouldUpdate = (now - lastProgressUpdate > 2000) || (progressData.processedFiles % 5 === 0);

      if (shouldUpdate) {
        lastProgressUpdate = now;

        // Calculate progress (10% to 95%)
        const fileProgress = (progressData.processedFiles / progressData.totalFiles) * 85;
        const totalProgress = 10 + fileProgress;

        WebSocketService.notifyUploadProgress(adminUserId, jobId, {
          type: 'processing',
          message: `Processing file ${progressData.processedFiles} of ${progressData.totalFiles}...`,
          progress: Math.round(totalProgress),
          processedFiles: progressData.processedFiles,
          totalFiles: progressData.totalFiles,
          matchedCount: progressData.matchedCount,
          notMatchedCount: progressData.notMatchedCount,
          currentFile: progressData.currentFile
        });
      }
    });

    console.log(`[Job ${jobId}] Processing completed - Matched: ${results.matchedCount}, Not Matched: ${results.notMatchedCount}`);

    // Phase 3: Cleanup
    WebSocketService.notifyUploadProgress(adminUserId, jobId, {
      type: 'processing',
      message: 'Cleaning up temporary files...',
      progress: 95
    });

    await cleanupExtraction(extractPath);
    await deleteZipFile(archivePath);

    // Phase 4: Finalize job
    await CertificateUploadJob.update(
      {
        status: 'completed',
        completedAt: new Date(),
        totalFiles: results.totalFiles,
        processedFiles: results.processedFiles,
        matchedCount: results.matchedCount,
        notMatchedCount: results.notMatchedCount,
        notMatchedList: results.notMatchedList,
        currentFile: null
      },
      { where: { jobId } }
    );

    // Send final WebSocket notification - completed
    WebSocketService.notifyUploadProgress(adminUserId, jobId, {
      type: 'completed',
      message: 'Processing completed successfully!',
      progress: 100,
      result: {
        totalFiles: results.totalFiles,
        matchedCount: results.matchedCount,
        notMatchedCount: results.notMatchedCount,
        notMatchedList: results.notMatchedList
      }
    });

    console.log(`[Job ${jobId}] Job completed successfully`);

  } catch (error) {
    console.error(`[Job ${jobId}] Processing error:`, error);

    // Cleanup on error
    if (extractPath) {
      const { cleanupExtraction } = require('./helpers/zipExtractor');
      await cleanupExtraction(extractPath);
    }

    // Update job as failed
    await CertificateUploadJob.update(
      {
        status: 'failed',
        errorMessage: error.message,
        completedAt: new Date()
      },
      { where: { jobId } }
    );

    // Send WebSocket notification - failed
    WebSocketService.notifyUploadProgress(adminUserId, jobId, {
      type: 'failed',
      message: 'Processing failed',
      error: error.message
    });
  }
}

/**
 * Get job status
 */
async function getJobStatus(jobId) {
  const job = await CertificateUploadJob.findOne({
    where: { jobId }
  });

  if (!job) {
    throw new Error('Job not found');
  }

  return job;
}

/**
 * Get all jobs (with pagination)
 */
async function getAllJobs(page = 1, limit = 10) {
  const offset = (page - 1) * limit;

  const { count, rows } = await CertificateUploadJob.findAndCountAll({
    limit,
    offset,
    order: [['createdAt', 'DESC']],
    include: [
      {
        association: 'uploader',
        attributes: ['userId', 'email', 'role']
      }
    ]
  });

  return {
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
    jobs: rows
  };
}

module.exports = {
  handleCertificateUpload,
  processCertificateUpload,
  getJobStatus,
  getAllJobs
};
