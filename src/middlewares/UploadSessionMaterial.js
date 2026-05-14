const { uploadSingleFile, uploadMultipleFiles } = require("../filesUpload");

const uploadSessionMaterials = uploadMultipleFiles(
  [{ name: "materials", maxCount: 10 }], // up to 10 files
  {
    allowedTypes: ["application"],
    allowedExtensions: [".pdf", ".zip",".ppt",".docx",".pptx"],
    destination: "uploads/sessions",
    maxSize: 50 * 1024 * 1024, 
  }
);

const uploadReceiptImage = uploadSingleFile("receipt", {
  allowedTypes: ["image"],
  allowedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
  destination: "uploads/receipt",
  maxSize: 10 * 1024 * 1024,
});

module.exports = {uploadSessionMaterials , uploadReceiptImage};
