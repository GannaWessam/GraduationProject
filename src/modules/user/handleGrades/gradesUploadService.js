/**
 * Database insertion logic for parsed student grades (Prompt A output).
 * Uses courseTitle exactly as provided; no parsing or normalization of course names.
 * One transaction per student; partial failures allowed (process students independently).
 */

const {
  sequelize,
  Student,
  event,
  exam,
  course,
  examReservation,
  studentCourse,
  Product,
  User,
  systemdata,
} = require("../../../models");
const { error } = require("../../../Util/ApiResponse");


/**
 * Resolve how many exams must be passed for this event, based on its product.requirdCourses.
 * Falls back to 7 if no product/setting is found.
 *
 * @param {string} eventId
 * @returns {Promise<number>}
 */
async function getRequiredExamsPassedForEvent(eventId) {
  const ev = await event.findByPk(eventId, {
    include: [
      {
        model: Product,
        attributes: ["requirdCourses"],
        required: false,
      },
    ],
  });

  const fromProduct = ev?.Product?.requirdCourses;
  if (
    typeof fromProduct === "number" &&
    Number.isInteger(fromProduct) &&
    fromProduct > 0
  ) {
    return fromProduct;
  }
  // Default fallback when not configured
  return 7;
}

/**
 * Status for exam reservation based on grade and dates.
 * - grade >= 65 → succeeded
 * - grade < 65 → failed
 * - grade null: exam_date < uploadDate → absent, else → reserved
 *
 * @param {number | null} grade
 * @param {Date} examDate
 * @param {Date} uploadDate
 * @returns {'succeeded' | 'failed' | 'absent' | 'reserved'}
 */
async function computeReservationStatus(grade, examDate, uploadDate) {
  console.log("/n/n/n/n method computeReservationStatus /n/n/n/n")
  const sd = await systemdata.findOne();
  if (grade !== null && grade !== undefined) {
    return grade >= Number(sd.successDegree) ? "succeeded" : "failed";
  }
  // grade is null
  if (examDate && uploadDate && new Date(examDate) < new Date(uploadDate)) {
    return "absent";
  }
  return "reserved";
}

/**
 * Fetch event and its exams joined with courses (course_title for exact match).
 * Builds a map: courseTitle (course.title) -> { examId, examDate }.
 * Uses course.title as stored in DB; match is exact (no normalization).
 *
 * @param {string} eventId - UUID of the event
 * @param {import('sequelize').Transaction} [t]
 * @returns {Promise<{ courseTitleToExam: Map<string, { examId: string, examDate: Date }> }>}
 */
async function getEventExamsWithCourses(eventId, t) {
  console.log("/n/n/n/n method getEventExamsWithCourses /n/n/n/n")

  const eventExists = await event.findByPk(eventId, { transaction: t });
  if (!eventExists) {
    throw new Error("Event not found");
  }

  const examsWithCourse = await exam.findAll({
    where: { eventId },
    include: [
      {
        model: course,
        attributes: ["courseId", "title"],
        required: true,
      },
    ],
    transaction: t,
    raw: false,
  });

  const courseTitleToExam = new Map();
  for (const ex of examsWithCourse) {
    console.log(ex.course);
    
    const c = ex.course;
    const title = c ? c.title : null;
    if (title != null && title !== "") {
      // Exact match only: use course title as stored in DB
      courseTitleToExam.set(title, {
        examId: ex.examId,
        examDate: ex.date,
        name:c.title
      });
    }
  }

  return { courseTitleToExam,eventExists };
}

async function handleFailedExam(courseTitle, userId) {
  console.log("/n/n/n/n method handleFailedExam /n/n/n/n");
  const courseRecord = await course.findOne({
    where: { title: courseTitle },
  });
  if (!courseRecord) {
    throw new Error("course_not_found_by_title");
  }
  try {
    await studentCourse.update(
      {
        examStatus: "failed",
      },
      {
        where: { courseId: courseRecord.courseId, userId: userId },
      }
    );
  } catch (error) {
    throw new Error("failed_to_update_student_course");
  }
}
async function handleSucessExam(courseTitle, userId) {
  console.log("/n/n/n/n method handleFailedExam /n/n/n/n");
  const courseRecord = await course.findOne({
    where: { title: courseTitle },
  });
  if (!courseRecord) {
    throw new Error("course_not_found_by_title");
  }
  try {
    await studentCourse.update(
      {
        examStatus: "sucess",
      },
      {
        where: { courseId: courseRecord.courseId, userId: userId },
      }
    );
  } catch (error) {
    throw new Error("failed_to_update_student_course");
  }
}

async function handleAbsentExam(courseTitle, userId) {
  console.log("/n/n/n/n method handleAbsentExam /n/n/n/n");
  const courseRecord = await course.findOne({
    where: { title: courseTitle },
  });
  if (!courseRecord) {
    throw new Error("course_not_found_by_title");
  }
  try {
    await studentCourse.update(
      {
        examStatus: "absent",
      },
      {
        where: { courseId: courseRecord.courseId, userId: userId },
      }
    );
  } catch (error) {
    throw new Error("failed_to_update_student_course");
  }
}
/**
 * Process one student: find exam reservations by matching courseTitle to event's exams,
 * update or create examReservation rows, then update student status if all required exams passed.
 *
 * @param {string} nationalId
 * @param {Date} uploadDate
 * @param {Array<{ courseTitle: string, grade: number | null }>} quizzes
 * @param {string} eventId
 * @param {Map<string, { examId: string, examDate: Date }>} courseTitleToExam
 * @param {import('sequelize').Transaction} t
 * @returns {{ examsUpdated: number, studentSucceeded: boolean }}
 */
async function processOneStudent(
  nationalId,
  uploadDate,
  quizzes, //for each student, we have an array of quizzes (courseTitle and grade)
  eventId,
  courseTitleToExam,// map from our db
  requiredExamsPassed,
  t
) {
    console.log("/n/n/n/n method processOneStudent /n/n/n/n")
  const studentRecord = await Student.findOne({
    where: { nationalId },
    transaction: t,
  });
  if (!studentRecord) {
    throw new Error("student_not_found_for_national_id");
  }

  const userId = studentRecord.userId;
  let examsUpdated = 0;
  // Per-student set of event courses not yet seen in this row (do not mutate shared courseTitleToExam)
  const remainingInEvent = new Set(courseTitleToExam.keys());

  let examCount = 0;
  for (const quiz of quizzes) { // excel quizzes 
    // Match exactly: use courseTitle as provided from Excel (Prompt A)
    const examInfo = courseTitleToExam.get(quiz.courseTitle);
    if (!examInfo) {
      // throw new Error("no_exam_found_for_course_and_student");
      continue;
    }
    examCount++;
    remainingInEvent.delete(quiz.courseTitle);

    const { examId, examDate } = examInfo;
    const status = await computeReservationStatus(
      quiz.grade,
      examDate,
      uploadDate
    );
    if(status === "failed"){
      await handleFailedExam(quiz.courseTitle,userId);
    }
    else if(status === "absent"){
      await handleAbsentExam(quiz.courseTitle,userId);
    }
    else if(status === "succeeded"){
      await handleSucessExam(quiz.courseTitle,userId);
    }
    
    const resultValue =
      quiz.grade !== null && quiz.grade !== undefined
        ? String(quiz.grade)
        : null;

    // Reservation rows are created when the student reserves the event; we only update here
    const er = await examReservation.findOne({
      where: { examId, userId },
      transaction: t,
    });

    if (er) {
      await er.update(
        {
          result: resultValue,
          reservationStatus: status,
        },
        { transaction: t }
      );
      examsUpdated += 1;
    }
  }
  if (remainingInEvent.size !== 0) {
    throw new Error("event_excel_courses_mismatch");
  }
  if (examCount !== courseTitleToExam.size) {
    const err = new Error(
      'exam_count_mismatch'
    );
    err.code = "exam_count_mismatch";
    err.details = {
      requiredExamsCount: courseTitleToExam.size,
      takenExamsCount: examCount,
      missingExams: [...remainingInEvent],
    };
    throw err;
  }


  // Student final status: succeeded only if all 7 required exams (for this event) have grade >= 65
  //courseTitleToExam gets the examId and examDate for each course in *specific event*
  const allExamIds = [...courseTitleToExam.values()].map((e) => e.examId);
  
  const passedCount = await (async () => {
    if (allExamIds.length === 0) return 0;
  
    const passedCourses = await studentCourse.findAll({
      where: { userId },
      attributes: ["examStatus"],
      transaction: t,
      raw: true,
    });
  
    return passedCourses
      .filter((r) => r.examStatus === "sucess")
      .length;
  })();

  const studentSucceeded = passedCount >= requiredExamsPassed;
  const studentFailed = passedCount < requiredExamsPassed;
  if (studentSucceeded) {
    await studentRecord.update({ status: "succeeded" }, { transaction: t });
    await studentCourse.destroy({
      where: {
        userId: userId
      },
      transaction: t
    });
    await User.increment("tokenVersion", { where: { userId: userId } });
  } else if (studentFailed) {
    await studentRecord.update({ status: "failed" }, { transaction: t });
    await User.increment("tokenVersion", { where: { userId: userId } });
  }

  return { examsUpdated, studentSucceeded, studentFailed };
}

/**
 * Upload parsed grades into the database for a given event.
 * Processes each student in a separate transaction; one failure does not roll back others.
 *
 * INPUT (from Prompt A / parseGradesFromExcelBuffer):
 *   parsedData: Array<{
 *     nationalId: string,
 *     uploadDate: Date,
 *     quizzes: Array<{ courseTitle: string, grade: number | null }>
 *   }>
 *
 * @param {Array<{
 *   nationalId: string,
 *   uploadDate: Date,
 *   quizzes: Array<{ courseTitle: string, grade: number | null }>
 * }>} parsedData
 * @param {string} eventId - UUID of the event
 * @returns {Promise<{
 *   studentsProcessed: number,
 *   examsUpdated: number,
 *   studentsSucceeded: number
 * }>}
 */
async function uploadFromExcel(parsedData, eventId) {
    console.log("/n/n/n/n method uploadFromExcel /n/n/n/n")

  if (!parsedData || !Array.isArray(parsedData)) {
    throw new Error("parsedData must be a non-null array");
  }
  if (!eventId) {
    throw new Error("eventId is required");
  }
  // Resolve event and build courseTitle -> exam map once (read-only, no transaction)
  const { courseTitleToExam,eventExists } = await getEventExamsWithCourses(eventId);
  // Resolve how many exams must be passed for this event (product.requirdCourses or fallback)
  const requiredExamsPassed = await getRequiredExamsPassedForEvent(eventId);

  let studentsProcessed = 0;
  let examsUpdated = 0;
  let studentsSucceeded = 0;

  for (const row of parsedData) { //for each student in the excel file
    try {
      await sequelize.transaction(async (t) => {
        const { examsUpdated: n, studentSucceeded } = await processOneStudent(
          row.nationalId,
          row.uploadDate,
          row.quizzes,
          eventId,
          courseTitleToExam,
          requiredExamsPassed,
          t
        );
        studentsProcessed += 1;
        examsUpdated += n;
        if (studentSucceeded) studentsSucceeded += 1;
      });
    } catch (err) {
      // Do not swallow: rethrow so caller can handle (e.g. log and continue or fail request)
      throw err;
    }
  }

  return {
    studentsProcessed,
    examsUpdated,
    studentsSucceeded,
    eventExists
  };
}

module.exports = {
  uploadFromExcel,
  getEventExamsWithCourses,
  processOneStudent,
  computeReservationStatus,
};
