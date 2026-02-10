const ExcelJS = require('exceljs');
const { reservation, event, Student, User } = require('../../../../models');
const { generateUsername } = require('./helpers/usernameHelper');
const { generatePasswordFromUsername } = require('./helpers/passwordHelper');

/** UUID v4 regex for validation */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Constants for Excel output (per spec) */
const CONSTANTS = {
  country: 'Egypt',
  city: 'Helwan',
  institution: 'Helwan University',
  department: 'TPIT',
  role1: 'student',
  sheetSuffix: '-Helwan-منح',
};

/**
 * Validates eventId and throws with a known error key for the error handler.
 * @param {string} eventId
 * @throws {Error} eventId_required | invalid_event_id_format
 */
function validateEventId(eventId) {
  if (eventId == null || String(eventId).trim() === '') {
    throw new Error('eventId_required');
  }
  if (!UUID_REGEX.test(String(eventId).trim())) {
    throw new Error('invalid_event_id_format');
  }
}

function splitFullName(fullName) {
  if (!fullName || typeof fullName !== 'string') {
    return { firstname: '', lastname: '' };
  }
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return { firstname: '', lastname: '' };
  if (parts.length === 1) return { firstname: parts[0], lastname: '' };
  return {
    firstname: parts[0],
    lastname: parts.slice(1).join(' '),
  };
}

/**
 * Fetches all reservations for an event with event, user, and student data.
 * Single query with JOINs (via Sequelize includes), deterministic ORDER BY students."userId".
 * @param {string} eventId - UUID of the event
 * @returns {Promise<{ eventName: string, language: string, rows: Array }>}
 * @throws {Error} no_reservations_for_event when no rows found (helps distinguish empty event)
 */
async function getReservationsWithDetails(eventId) {
  const reservations = await reservation.findAll({
    where: { eventId },
    include: [
      {
        model: event,
        as: 'reservationEvent',
        attributes: ['eventName', 'language'],
        required: true,
      },
      {
        model: Student,
        attributes: ['userId', 'fullName', 'nationalId'],
        required: true,
        include: [
          {
            model: User,
            attributes: ['email'],
            required: true,
          },
        ],
      },
    ],
    order: [[Student, 'userId', 'ASC']],
    raw: false,
  });

  if (!reservations.length) {
    throw new Error('no_reservations_for_event');
  }

  const eventName = reservations[0].reservationEvent?.eventName ?? '';
  const language = reservations[0].reservationEvent?.language ?? '';
  const rows = reservations.map((r) => {
    const student = r.Student;
    const user = student?.User;
    return {
      eventName,
      language,
      email: user?.email ?? '',
      fullName: student?.fullName ?? '',
      nationalId: student?.nationalId ?? '',
    };
  });

  return { eventName, language, rows };
}

/**
 * Builds Excel workbook in memory and returns it (no file on disk).
 * Workbook/Sheet name: eventName-Helwan-منح
 * Columns: username, firstname, lastname, idnumber, email, country, city, password, institution, department, group1, course1, role1
 * @param {string} eventName
 * @param {string} language
 * @param {Array<{ username, firstname, lastname, idnumber, email, password, group1, course1 }>} dataRows
 * @returns {Promise<ExcelJS.Workbook>}
 */
async function buildWorkbook(eventName, language, dataRows) {
  const workbook = new ExcelJS.Workbook();
  const sheetName = `${eventName}${CONSTANTS.sheetSuffix}`;
  const worksheet = workbook.addWorksheet(sheetName, {
    views: [{ rightToLeft: false }],
  });

  // Header row (exact order per spec)
  const headers = [
    'username',
    'firstname',
    'lastname',
    'idnumber',
    'email',
    'country',
    'city',
    'password',
    'institution',
    'department',
    'group1',
    'course1',
    'role1',
  ];
  worksheet.addRow(headers);

  // Data rows
  for (const row of dataRows) {
    worksheet.addRow([
      row.username,
      row.firstname,
      row.lastname,
      row.idnumber,
      row.email,
      CONSTANTS.country,
      CONSTANTS.city,
      row.password,
      CONSTANTS.institution,
      CONSTANTS.department,
      row.group1,
      row.course1,
      CONSTANTS.role1,
    ]);
  }

  // UTF-8 / column widths for readability
  worksheet.columns.forEach((col, i) => {
    col.width = 18;
  });

  return workbook;
}


async function generateStudentDataExcel(eventId) {
  validateEventId(eventId);

  let eventName, language, rows;
  try {
    const result = await getReservationsWithDetails(eventId);
    eventName = result.eventName;
    language = result.language;
    rows = result.rows;
  } catch (err) {
    if (err.message === 'no_reservations_for_event') throw err;
    throw new Error('error_in_getting_student_data'); 
  }

  const dataRows = rows.map((row, index) => {
    const counter = index + 1;
    const username = generateUsername(row.eventName, counter);
    const password = generatePasswordFromUsername(username);
    const { firstname, lastname } = splitFullName(row.fullName);
    const course1 = `Helwan University - Helwan - ${row.language}`;

    return {
      username,
      firstname,
      lastname,
      idnumber: row.nationalId,
      email: row.email,
      password,
      group1: row.eventName,
      course1,
    };
  });

  let workbook;
  try {
    workbook = await buildWorkbook(eventName, language, dataRows);
  } catch (err) {
    throw new Error('excel_generation_failed');
  }

  return { workbook, eventName };
}

module.exports = {
  validateEventId,
  getReservationsWithDetails,
  generateStudentDataExcel,
  splitFullName,
};
