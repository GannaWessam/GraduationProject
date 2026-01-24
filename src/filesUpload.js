const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const fileUpload = ({
  allowedTypes = ["image"],          
  allowedExtensions = [],            
  maxSize = 10 * 1024 * 1024,         
  destination = "uploads",
} = {}) => {

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, destination);
    },
    filename: (req, file, cb) => {
      cb(null, uuidv4() + path.extname(file.originalname));
    },
  });

  const fileFilter = (req, file, cb) => {
    const mimeMainType = file.mimetype.split("/")[0];
    const ext = path.extname(file.originalname).toLowerCase();

    // ✔️ check mime OR extension
    if (
      allowedTypes.includes(mimeMainType) ||
      allowedExtensions.includes(ext)
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Invalid file type. Allowed: ${allowedExtensions.join(", ")}`
        ),
        false
      );
    }
  };

  return multer({
    storage,
    limits: { fileSize: maxSize },
    fileFilter,
  });
};

// ====================
// Helpers
// ====================
const uploadSingleFile = (fieldName, options) =>
  fileUpload(options).single(fieldName);

const uploadMultipleFiles = (arrayOfFields, options) =>
  fileUpload(options).fields(arrayOfFields);

module.exports = {
  fileUpload,
  uploadSingleFile,
  uploadMultipleFiles,
};
