const express = require("express");
const multer = require("multer");
const path = require("path");
const { uploadGrades } = require("./gradesController");
const { validateToken } = require("../../../middlewares/token");
const checkPermission = require("../../../middlewares/checkPermission");

const router = express.Router();

// Configure multer to use memoryStorage and enforce:
// - Max file size: 5 MB
// - Accept ONLY .xlsx files (by MIME type and extension)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const isXlsxMime =
      file.mimetype ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    if (isXlsxMime && ext === ".xlsx") {
      return cb(null, true);
    }

    // Reject invalid MIME types or extensions by silently skipping the file.
    // Controller will see `req.file` as undefined and return a 400 response.
    return cb(null, false);
  },
});


router.post(
  "/upload/:id",
  validateToken,
  upload.single("file"),
  checkPermission("UPLOAD_RESULTS"),
  uploadGrades
);

module.exports = router;

