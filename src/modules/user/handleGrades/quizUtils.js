/**
 * Grade value parsing only. No column detection, header normalization,
 * or course-name extraction — column meaning is determined by DB (course.title).
 */

/**
 * Attempt to parse a cell value into a numeric grade.
 * Returns null for "-", empty, or missing values.
 *
 * @param {any} rawValue
 * @returns {{ grade: number | null, error: string | null }}
 */
function parseGradeValue(rawValue) {
  if (rawValue === null || rawValue === undefined) {
    return { grade: null, error: null };
  }

  if (typeof rawValue === "string") {
    const trimmed = rawValue.trim();
    if (!trimmed || trimmed === "-") {
      return { grade: null, error: null };
    }

    const numeric = Number(trimmed.replace(",", "."));
    if (Number.isNaN(numeric)) {
      return { grade: null, error: "Grade is not a valid number" };
    }

    return { grade: numeric, error: null };
  }

  if (typeof rawValue === "number") {
    return { grade: rawValue, error: null };
  }

  return { grade: null, error: "Unsupported grade value type" };
}

/**
 * Get grade for a single cell. Validates 0–100 range.
 * Used for course grade columns (one column per course, identified by exact header match to course.title).
 *
 * @param {import("exceljs").Row} row
 * @param {number} columnIndex
 * @returns {{ grade: number | null, error: string | null }}
 */
function getGradeForCell(row, columnIndex) {
  const cell = row.getCell(columnIndex);
  const rawValue = cell ? cell.value : null;

  const { grade, error: parseError } = parseGradeValue(rawValue);

  if (parseError) {
    return { grade: null, error: parseError };
  }

  if (grade === null) {
    return { grade: null, error: null };
  }

  if (grade < 0 || grade > 100) {
    return { grade: null, error: "Grade must be between 0 and 100" };
  }

  return { grade, error: null };
}

module.exports = {
  parseGradeValue,
  getGradeForCell,
};
