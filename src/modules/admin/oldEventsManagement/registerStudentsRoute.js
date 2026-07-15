const express = require("express");
const multer = require("multer");
const { registerStudentsToEvent } = require("./registerStudentsController");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } 
});

router.post(
  "/events/:eventId/register-students",
  upload.single("file"),
  registerStudentsToEvent
);

module.exports = router;
