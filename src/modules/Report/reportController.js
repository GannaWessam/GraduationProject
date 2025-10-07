const ReportService = require("./reportService.js");
const { Student } = require("../../models/index.js");
const ApiResponse = require("../../Util/ApiResponse.js");

exports.getStudentRegistrationReport = async (req, res, next) => {
  try {
    const { format } = req.query; // pdf or excel

    const fields = [
      "fullName",
      "NameEn",
      "Mobile",
      "StudyLan",
      "nationality",
      "nationalId",
      "university",
      "college",
      "department",
      "status",
    ];

    const filePath = await ReportService.generateReport({
      model: Student,
      fields,
      filters: {}, // can add {status: "active"} etc
      format,
      filename: `students_${Date.now()}`,
    });

    return res.download(filePath);
  } catch (err) {
    next(err);
  }
};
