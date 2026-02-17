const ExcelJS = require("exceljs");
const { getGradeForCell } = require("./quizUtils");
const { course, Student } = require("../../../models");

/**
 * Validate nationalId: must be a string of exactly 14 digits.
 *
 * @param {any} value
 * @returns {boolean}
 */
function isValidNationalId(value) {
  if (value === null || value === undefined) return false;
  const str = value.toString().trim();
  return /^\d{14}$/.test(str);
}

/**
 * Load all course titles from DB (source of truth for grade columns).
 * Exact string match only; no transformation.
 *
 * @returns {Promise<Set<string>>}
 */
async function loadCourseTitles() {
  const rows = await course.findAll({
    attributes: ["title"],
    raw: true,
  });
  const set = new Set();
  for (const r of rows) {
    if (r.title != null && r.title !== "") {
      set.add(r.title);
    }
  }
  return set;
}

/**
 * Build map of header row (value -> colNumber) index from row 1.
 * Header values are used as-is (no trim, no lowercasing).
 *
 * @param {import("exceljs").Row} headerRow
 * @returns {Map<any, number>}
 */
function buildHeaderIndexMap(headerRow) {
  const map = new Map();
  headerRow.eachCell((cell, colNumber) => {
    if (cell == null) return;
    const value = cell.value;
    if (value === null || value === undefined) return;
    map.set(value, colNumber);
  });
  return map;
}

/**
 * Build map of course title -> column index for columns that are grade columns.
 * A column is a grade column iff its header value EXISTS AS-IS in course.title (DB).
 * No trimming, lowercasing, or parsing of headers.
 *
 * @param {import("exceljs").Row} headerRow
 * @param {Set<string>} validCourseTitles
 * @returns {Map<string, number>}
 */
// bgeb el coulmns elly feha grades bs
function buildGradeColumnMap(headerRow, validCourseTitles) {
  const gradeColumns = new Map();
  headerRow.eachCell((cell, colNumber) => {
    if (cell == null) return;
    const headerValue = cell.value;
    if (headerValue === null || headerValue === undefined) return;
    // Exact match only: header must exist as-is in DB course titles
    if (typeof headerValue === "string" && validCourseTitles.has(headerValue)) {
      if (!gradeColumns.has(headerValue)) {
        gradeColumns.set(headerValue, colNumber);
      }
    }
  });
  return gradeColumns;
}

/**
 * Normalize the Excel buffer into the required structure.
 * Grade columns are determined only by exact match to course.title (DB).
 * Row-level errors are collected (invalid nationalId, student not found, invalid grade).
 *
 * @param {Buffer} buffer
 * @returns {Promise<{
 *  studentsParsed: number,
 *  quizzesParsed: number,
 *  errors: Array<{ row: number, reason: string }>,
 *  parsedData: Array<{
 *    nationalId: string,
 *    uploadDate: Date,
 *    quizzes: Array<{ courseTitle: string, grade: number | null }>
 *  }>
 * }>}
 */
async function parseGradesFromExcelBuffer(buffer) {
  if (!buffer) {
    throw new Error("Excel buffer is required");
  }

  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.load(buffer); //load is used not read because it's in memory
  } catch (err) {
    throw new Error("Failed to parse Excel file from buffer/request");
  }

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error("No worksheet found in Excel file");
  }

  const headerRow = worksheet.getRow(1);
  if (!headerRow || headerRow.cellCount === 0) {
    throw new Error("Header row is missing in Excel file");
  }

  // Load course titles once per upload (in memory)
  const validCourseTitles = await loadCourseTitles();

  // Header values as-is (no transformation)
  const headerIndexMap = buildHeaderIndexMap(headerRow);

  const nationalIdHeader = "ID number";
  const nationalIdCol = headerIndexMap.get(nationalIdHeader); //index of the column that contains the national id
  if (nationalIdCol == null) {
    throw new Error("required_column_not_found");
  }

  // Grade columns: only those whose header exists exactly in course.title
  const gradeColumnMap = buildGradeColumnMap(headerRow, validCourseTitles);

  const errors = [];
  const parsedData = [];
  let studentsParsed = 0;
  let quizzesParsed = 0;
  const uploadDate = new Date();

  const dataRows = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    dataRows.push({ row, rowNumber });
  });

  for (const { row, rowNumber } of dataRows) {

    const nationalIdCell = row.getCell(nationalIdCol);
    const nationalIdRaw =
      nationalIdCell && nationalIdCell.value != null
        ? nationalIdCell.value.toString()
        : "";
    const nationalIdTrimmed = nationalIdRaw.trim();

    // if (!isValidNationalId(nationalIdTrimmed)) {
    //   errors.push({
    //     row: rowNumber,
    //     reason: "Invalid nationalId (must be 14 digits)",
    //   });
    //   continue;
    // }

    const student = await Student.findOne({
      where: { nationalId: nationalIdTrimmed },
    });
    if (!student) {
      errors.push({ row: rowNumber, reason: "Student not found" });
      const err = new Error("student_not_found_for_national_id");
      err.nationalId = nationalIdTrimmed;
      throw err;
    }

    const quizzes = [];
    //this loop is used to get all grades for each student (row)
    for (const [courseTitle, columnIndex] of gradeColumnMap.entries()) { //entries() returns an iterator of [key, value] pairs
      const { grade, error } = getGradeForCell(row, columnIndex);

      if (error) {
        errors.push({
          row: rowNumber,
          reason: `Invalid grade for course "${courseTitle}": ${error}`,
        });
      }

      quizzes.push({
        courseTitle,
        grade: grade === null ? null : grade,
      });
      quizzesParsed += 1;
    }

    parsedData.push({
      nationalId: nationalIdTrimmed,
      uploadDate,
      quizzes,
    });
    studentsParsed += 1;
  }

  return {
    studentsParsed,
    quizzesParsed,
    errors,
    parsedData,
  };
}

module.exports = {
  parseGradesFromExcelBuffer,
};
