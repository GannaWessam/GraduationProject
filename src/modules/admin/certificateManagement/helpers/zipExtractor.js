const AdmZip = require('adm-zip');
const { createExtractorFromFile } = require('node-unrar-js');
const fs = require('fs');
const path = require('path');

/**
 * Detect archive type from file extension
 */
function getArchiveType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.zip') return 'zip';
  if (ext === '.rar') return 'rar';
  throw new Error('Unsupported archive format. Only ZIP and RAR files are supported.');
}

/**
 * Extract ZIP file
 */
function extractZip(zipPath, extractPath) {
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(extractPath, true);
}

/**
 * Extract RAR file
 */
async function extractRar(rarPath, extractPath) {
  try {
    // Read RAR file as buffer
    const rarBuffer = fs.readFileSync(rarPath);

    const extractor = await createExtractorFromFile({
      filepath: rarPath,
      targetPath: extractPath
    });

    // Extract with proper iteration
    const list = extractor.getFileList();
    const fileHeaders = [...list.fileHeaders];

    for (const header of fileHeaders) {
      if (!header.flags.directory) {
        const extracted = extractor.extract({
          files: [header.name]
        });

        const files = [...extracted.files];

        for (const file of files) {
          const filePath = path.join(extractPath, file.fileHeader.name);
          const dir = path.dirname(filePath);

          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }

          // node-unrar-js returns extraction as Uint8Array or Buffer
          if (file.extraction) {
            const buffer = Buffer.from(file.extraction);
            fs.writeFileSync(filePath, buffer);
          }
        }
      }
    }
  } catch (error) {
    throw new Error(`RAR extraction failed: ${error.message}`);
  }
}

/**
 * Extract archive file (ZIP or RAR) and find all PDF files
 * @param {string} archivePath - Path to archive file
 * @param {string} jobId - Job ID for extraction folder
 * @returns {Promise<{extractPath: string, pdfFiles: Array}>}
 */
async function extractAndScanZip(archivePath, jobId) {
  try {
    // Create extraction directory
    const extractPath = path.join('uploads', 'temp', 'certificates', jobId, 'extracted');

    if (!fs.existsSync(extractPath)) {
      fs.mkdirSync(extractPath, { recursive: true });
    }

    // Detect archive type and extract
    const archiveType = getArchiveType(archivePath);

    if (archiveType === 'zip') {
      extractZip(archivePath, extractPath);
    } else if (archiveType === 'rar') {
      await extractRar(archivePath, extractPath);
    }

    // Recursively find all PDF files
    const pdfFiles = [];

    function scanDirectory(dirPath) {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          // Skip macOS metadata folders
          if (entry.name !== '__MACOSX' && !entry.name.startsWith('.')) {
            scanDirectory(fullPath);
          }
        } else if (entry.isFile()) {
          // Check if it's a PDF file
          if (entry.name.toLowerCase().endsWith('.pdf') && !entry.name.startsWith('.')) {
            pdfFiles.push({
              fullPath: fullPath,
              fileName: entry.name,
              relativePath: path.relative(extractPath, fullPath)
            });
          }
        }
      }
    }

    // Start scanning from extraction directory
    scanDirectory(extractPath);

    if (pdfFiles.length === 0) {
      throw new Error('No PDF files found in ZIP archive');
    }

    return {
      extractPath,
      pdfFiles
    };

  } catch (error) {
    console.error('Archive extraction error:', error);
    throw new Error(`Failed to extract archive: ${error.message}`);
  }
}

/**
 * Clean up extraction directory
 * @param {string} extractPath - Path to extraction directory
 */
async function cleanupExtraction(extractPath) {
  try {
    if (fs.existsSync(extractPath)) {
      fs.rmSync(extractPath, { recursive: true, force: true });
    }
  } catch (error) {
    console.error('Cleanup error:', error);
    // Don't throw - cleanup failure shouldn't break the process
  }
}

/**
 * Delete archive file (ZIP or RAR)
 * @param {string} archivePath - Path to archive file
 */
async function deleteZipFile(archivePath) {
  try {
    if (fs.existsSync(archivePath)) {
      fs.unlinkSync(archivePath);
    }
  } catch (error) {
    console.error('Delete archive error:', error);
    // Don't throw - deletion failure shouldn't break the process
  }
}

module.exports = {
  extractAndScanZip,
  cleanupExtraction,
  deleteZipFile
};
