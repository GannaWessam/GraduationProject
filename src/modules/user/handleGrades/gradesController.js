const { parseGradesFromExcelBuffer } = require("./gradesParsingService");

const uploadGrades = async (req, res, next) => {
  try {
    // Multer will populate req.file when using upload.single("file")
    if (!req.file) {
      return res.status(400).json({
        studentsParsed: 0,
        quizzesParsed: 0,
        errors: [{ row: 0, reason: "No file uploaded or invalid file type" }],
        parsedData: [],
      });
    }

    const { buffer, mimetype, originalname } = req.file;

    const isXlsxMime = //type
      mimetype ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    const isXlsxExt = originalname.toLowerCase().endsWith(".xlsx"); //extension

    if (!isXlsxMime || !isXlsxExt) {
      return res.status(400).json({
        studentsParsed: 0,
        quizzesParsed: 0,
        errors: [
          {
            row: 0,
            reason: "Invalid file type. Only .xlsx files are allowed.",
          },
        ],
        parsedData: [],
      });
    }

    const result = await parseGradesFromExcelBuffer(buffer);

    return res.status(200).json(result);
  } catch (error) {
    // Fatal errors (invalid file, parsing failure, etc.) are forwarded
    // to the global error handler.
    return next(error);
  }
};

module.exports = {
  uploadGrades,
};

