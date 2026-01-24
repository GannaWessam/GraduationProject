const { uploadSingleFile, uploadMultipleFiles } = require("../filesUpload");

const uploadSessionMaterials = uploadMultipleFiles(
  [{ name: "materials", maxCount: 10 }], // up to 10 files
  {
    allowedTypes: ["application"],
    allowedExtensions: [".pdf", ".zip"],
    destination: "uploads/sessions",
    maxSize: 50 * 1024 * 1024, 
  }
);

module.exports = {uploadSessionMaterials};
