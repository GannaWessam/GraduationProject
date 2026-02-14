const { parseGradesFromExcelBuffer } = require("./gradesParsingService");
const { uploadFromExcel } = require("./gradesUploadService");

const uploadGrades = async (req, res, next) => {
  try {
    // Multer will populate req.file when using upload.single("file")
    if (!req.file) {
      return res.status(400).json({
        studentsProcessed: 0,
        examsUpdated: 0,
        studentsSucceeded: 0,
        studentsParsed: 0,
        quizzesParsed: 0,
        errors: [{ row: 0, reason: "No file uploaded or invalid file type" }],
        parsedData: [],
      });
    }

    const { buffer, mimetype, originalname } = req.file;
    const eventId = req.query.eventId || req.body?.eventId;

    const isXlsxMime =
      mimetype ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"; //type
    const isXlsxExt = originalname.toLowerCase().endsWith(".xlsx"); //extension

    if (!isXlsxMime || !isXlsxExt) {
      return res.status(400).json({
        studentsProcessed: 0,
        examsUpdated: 0,
        studentsSucceeded: 0,
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

    const parseResult = await parseGradesFromExcelBuffer(buffer);
       //parseResult.parsedData is : Array<{
        //  nationalId: string,
        //  uploadDate: Date,
        //  quizzes: Array<{ courseTitle: string, grade: number | null }>
        //}>

    // If eventId provided, persist grades and return upload summary
    if (eventId) {
      const summary = await uploadFromExcel(parseResult.parsedData, eventId);
      return res.status(200).json({
        ...summary,
        studentsParsed: parseResult.studentsParsed,
        quizzesParsed: parseResult.quizzesParsed,
        errors: parseResult.errors,
        parsedData: parseResult.parsedData,
      });
    }

    // No eventId: return parsing result only (no DB insertion)
    return res.status(200).json({
      errors: [{reason: "EventId is required to upload grades to the database" }],
      studentsProcessed: 0,
      examsUpdated: 0,
      studentsSucceeded: 0,
      ...parseResult,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  uploadGrades,
};

