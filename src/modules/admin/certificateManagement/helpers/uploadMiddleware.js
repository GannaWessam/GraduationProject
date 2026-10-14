const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure temp directory exists
const tempDir = 'uploads/temp/certificates';
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    // Temporary name, will be renamed in service
    const uniqueName = `temp_${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  }
});

// File filter - ZIP and RAR files only
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/zip',
    'application/x-zip-compressed',
    'application/x-rar-compressed',
    'application/vnd.rar',
    'application/x-rar'
  ];

  const allowedExtensions = ['.zip', '.rar'];
  const fileExt = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));

  if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExt)) {
    cb(null, true);
  } else {
    cb(new Error('Only ZIP and RAR files are allowed'), false);
  }
};

// Create upload middleware
const uploadZip = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 1024  // 1GB limit
  }
});

module.exports = {
  uploadZip
};
