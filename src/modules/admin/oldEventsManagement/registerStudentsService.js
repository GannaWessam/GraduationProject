const XLSX = require("xlsx");
const ExcelJS = require("exceljs");

const reserve = require("../../user/reserveEvents/reservationService");
const { Student } = require("../../../models");
const { parseGradesFromExcelBuffer } = require("../../user/handleGrades/gradesParsingService");
const { uploadFromExcel } = require("../../user/handleGrades/gradesUploadService");

function loadNationalIdsFromBuffer(buffer) {
  const workbook = XLSX.read(buffer, { type: "buffer" });

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const data = XLSX.utils.sheet_to_json(sheet);

  return data
    .map(row => (row["ID number"] != null ? String(row["ID number"]).trim() : null))
    .filter(Boolean);
}

function filterExcelBufferByNationalIds(originalBuffer, allowedNationalIds) {
  const allowedSet = new Set(allowedNationalIds);

  const workbook = XLSX.read(originalBuffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_json(sheet);

  const filteredRows = rows.filter(row => {
    const id = row["ID number"] != null ? String(row["ID number"]).trim() : null;
    return id && allowedSet.has(id);
  });

  const filteredSheet = XLSX.utils.json_to_sheet(filteredRows);

  const filteredWorkbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(filteredWorkbook, filteredSheet, sheetName);

  return XLSX.write(filteredWorkbook, { type: "buffer", bookType: "xlsx" });
}
async function registerStudentsFromExcel(eventId, fileBuffer) {
  if (!eventId) {
    const err = new Error("eventId is required");
    err.statusCode = 400;
    throw err;
  }

  if (!fileBuffer) {
    const err = new Error("Excel file buffer is required");
    err.statusCode = 400;
    throw err;
  }

  let nationalIds;
  try {
    nationalIds = loadNationalIdsFromBuffer(fileBuffer);
  } catch (err) {
    err.statusCode = 400;
    err.message = `Could not read Excel file: ${err.message}`;
    throw err;
  }

  if (nationalIds.length === 0) {
    const err = new Error("No valid nationalId values found in the file");
    err.statusCode = 400;
    throw err;
  }

  const students = await Student.findAll({
    where: { nationalId: nationalIds },
    attributes: ["userId", "nationalId"]
  });

  const foundIds = new Set(students.map(s => s.nationalId));
  const notFoundIds = nationalIds.filter(id => !foundIds.has(id));

  let successCount = 0;
  const failed = [];
  const successfulNationalIds = [];

  for (const student of students) {
    try {
      await reserve.registerForExam(student.userId, eventId);
      successCount++;
      successfulNationalIds.push(student.nationalId);
    } catch (err) {
      failed.push({ nationalId: student.nationalId, reason: err.message });
    }
  }

  let gradesUpload = {
    studentsParsed: 0,
    quizzesParsed: 0,
    examsUpdated: 0,
    studentsSucceeded: 0,
    errors: []
  };

  if (successfulNationalIds.length > 0) {
    try {
      const filteredBuffer = filterExcelBufferByNationalIds(fileBuffer, successfulNationalIds);

      const parseResult = await parseGradesFromExcelBuffer(filteredBuffer, eventId);

      const uploadSummary = await uploadFromExcel(parseResult.parsedData, eventId);

      gradesUpload = {
        studentsParsed: parseResult.studentsParsed,
        quizzesParsed: parseResult.quizzesParsed,
        errors: parseResult.errors,
        ...uploadSummary
      };
    } catch (err) {
      gradesUpload.errors.push({ row: 0, reason: `Grades upload failed: ${err.message}` });
    }
  }

  return {
    eventId,
    totalInFile: nationalIds.length,
    totalMatched: students.length,
    successCount,
    failedCount: failed.length,
    notFoundCount: notFoundIds.length,
    failed,
    notFoundIds,
    gradesUpload
  };
}

function buildFailedStudentsWorkbook(summary) {
  const { failed, notFoundIds, gradesUpload } = summary;
  const gradeErrors = gradesUpload?.errors || [];

  if (failed.length === 0 && notFoundIds.length === 0 && gradeErrors.length === 0) {
    return null;
  }

  const workbook = new ExcelJS.Workbook();

  const failedSheet = workbook.addWorksheet("Failed");

  failedSheet.columns = [
    {
      header: "ID Number",
      key: "nationalId",
      width: 25,
    },
    {
      header: "Reason",
      key: "reason",
      width: 40,
    },
  ];

  failed.forEach((f) => {
    failedSheet.addRow({
      nationalId: f.nationalId,
      reason: f.reason,
    });
  });

  failedSheet.getRow(1).font = {
    bold: true,
  };

  const notFoundSheet = workbook.addWorksheet("Not Found");

  notFoundSheet.columns = [
    {
      header: "ID Number",
      key: "nationalId",
      width: 25,
    },
  ];

  notFoundIds.forEach((id) => {
    notFoundSheet.addRow({
      nationalId: id,
    });
  });

  notFoundSheet.getRow(1).font = {
    bold: true,
  };

  const gradeErrorsSheet = workbook.addWorksheet("Grade Errors");

  gradeErrorsSheet.columns = [
    {
      header: "Row",
      key: "row",
      width: 10,
    },
    {
      header: "Reason",
      key: "reason",
      width: 50,
    },
  ];

  gradeErrors.forEach((e) => {
    gradeErrorsSheet.addRow({
      row: e.row,
      reason: e.reason,
    });
  });

  gradeErrorsSheet.getRow(1).font = {
    bold: true,
  };

  return workbook;
}

module.exports = {
  registerStudentsFromExcel,
  loadNationalIdsFromBuffer,
  filterExcelBufferByNationalIds,
  buildFailedStudentsWorkbook
};