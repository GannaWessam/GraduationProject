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
      if(req && req.audit)
      {
        req.audit.message = "OCR connection timeout | لم يتمكن من الوصول الى OCR"
      }
      return res.status(500).json(result);
    }
    if(req && req.audit)
      {
        req.audit.message = "OCR Process the image successfully |تم معالجة الصورة بنجاح بواسطة OCR"
      }
    return res.status(200).json(result);
    
  } catch (error) {
    if(req && req.audit)
      {
        req.audit.message = "OCR connection timeout | لم يتمكن من الوصول الى OCR"
      }
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  ocrController,
};