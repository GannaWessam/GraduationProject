const fs = require('fs');
const path = require('path');
const { Student, UserCertificate } = require('../../../../models');
const { extractNameFromFileName } = require('./nameExtractor');
const sequelize = require('../../../../connections/db');

async function processCertificateFile(fileInfo, batchName = null) {
  const result = {
    fileName: fileInfo.fileName,
    matched: false,
    created: false,
    updated: false,
    student: null,
    extractedName: null,
    reason: null
  };

  try {
    const extractedName = extractNameFromFileName(fileInfo.fileName);
    result.extractedName = extractedName;

    if (!extractedName) {
      result.reason = 'Could not extract name from filename';
      return result;
    }

    const student = await Student.findOne({
      where: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('NameEn')),
        extractedName.toLowerCase()
      ),
      attributes: ['userId', 'fullName', 'NameEn', 'nationalId']
    });

    if (!student) {
      result.reason = 'Student not found with name: ' + extractedName;
      return result;
    }

    result.student = student.toJSON();

    const permanentDir = 'uploads/certificates';
    if (!fs.existsSync(permanentDir)) {
      fs.mkdirSync(permanentDir, { recursive: true });
    }

    const permanentPath = path.join(permanentDir, fileInfo.fileName);
    const fileExistedBefore = fs.existsSync(permanentPath);

    await fs.promises.copyFile(fileInfo.fullPath, permanentPath);

    try {
      await sequelize.transaction(async (t) => {
        const existingCertificate = await UserCertificate.findOne({
          where: {
            userId: student.userId,
            fileName: fileInfo.fileName
          },
          transaction: t
        });

        if (existingCertificate) {
          await existingCertificate.update({
            uploadBatch: batchName,
            updatedAt: new Date()
          }, { transaction: t });
          result.matched = true;
          result.updated = true;
        } else {
          await UserCertificate.create({
            userId: student.userId,
            fileName: fileInfo.fileName,
            certificatePath: permanentPath,
            uploadBatch: batchName
          }, { transaction: t });
          result.matched = true;
          result.created = true;
        }

        await student.update({ certificateUploaded: true }, { transaction: t });
      });
    } catch (error) {
      if (!fileExistedBefore) {
        await fs.promises.unlink(permanentPath).catch(() => {});
      }
      throw error;
    }

    return result;

  } catch (error) {
    console.error('Error processing file:', fileInfo.fileName, error);
    result.reason = 'Processing error: ' + error.message;
    return result;
  }
}

/**
 * Process multiple certificate files
 * @param {Array} pdfFiles - Array of PDF file info objects
 * @param {string} batchName - Batch identifier (optional)
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>} - Processing summary
 */
async function processCertificateFiles(pdfFiles, batchName = null, onProgress) {
  const results = {
    totalFiles: pdfFiles.length,
    processedFiles: 0,
    matchedCount: 0,
    notMatchedCount: 0,
    notMatchedList: []
  };

  for (let i = 0; i < pdfFiles.length; i++) {
    const fileInfo = pdfFiles[i];

    // Process file
    const fileResult = await processCertificateFile(fileInfo, batchName);

    results.processedFiles++;

    if (fileResult.matched) {
      results.matchedCount++;
    } else {
      results.notMatchedCount++;
      results.notMatchedList.push({
        fileName: fileResult.fileName,
        extractedName: fileResult.extractedName || 'N/A',
        reason: fileResult.reason || 'Unknown error'
      });
    }

    // Call progress callback
    if (onProgress) {
      await onProgress({
        processedFiles: results.processedFiles,
        totalFiles: results.totalFiles,
        matchedCount: results.matchedCount,
        notMatchedCount: results.notMatchedCount,
        currentFile: fileInfo.fileName
      });
    }
  }

  return results;
}

module.exports = {
  processCertificateFile,
  processCertificateFiles
};
