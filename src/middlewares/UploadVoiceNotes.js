const { uploadSingleFile } = require("../filesUpload");

const uploadVoiceMessage = uploadSingleFile("voice", {
  allowedTypes: ["audio"],
  allowedExtensions: [".webm", ".ogg", ".mp3", ".wav"],
  destination: "uploads/voices",
  maxSize: 10 * 1024 * 1024
});

module.exports = { uploadVoiceMessage };
