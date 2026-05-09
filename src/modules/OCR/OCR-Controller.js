const { sendOcrRequest } = require("./OCR-Service");

async function ocrController(req, res) {
  try {
    const { base64Image } = req.body;

    if (!base64Image) {
      return res.status(400).json({
        success: false,
        message: "base64Image is required",
      });
    }

    const result = await sendOcrRequest(base64Image);

    if (!result.success) {
      return res.status(500).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  ocrController,
};