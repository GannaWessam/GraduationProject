const cron = require("node-cron");
const { Student, productCourse, examReservation, exam } = require("../models");
const { Op } = require("sequelize");

class FinishStudentProgramService {
  constructor() {
    this.cronJob = null;
    this.isRunning = false;
  }

  init() {
    this.cronJob = cron.schedule(
      "30 2 * * *",
      async () => {
        await this.processStudents();
      },
      {
        scheduled: true,
        timezone: "Africa/Cairo",
      },
    );

    console.log(
      "Finish Student Program Service initialized - Running daily at 04:30 AM Egypt time",
    );
  }

  async processStudents() {
    if (this.isRunning) {
      console.log("FinishStudentProgram already running... skipping");
      return;
    }

    this.isRunning = true;
    console.log("\n=========== STUDENT EXAM GRADUATION CHECK ===========");

    try {
      const students = await Student.findAll({
        where: {
          productId: { [Op.ne]: null },
          status: { [Op.ne]: "finished_exam" },
        },
        attributes: ["userId", "fullName", "productId", "status"],
      });

      console.log(`Students to check: ${students.length}`);

      for (const student of students) {
        try {
          await this.checkStudent(student);
        } catch (err) {
          console.error(`Error processing ${student.fullName}:`, err.message);
        }
      }
    } catch (error) {
      console.error("Fatal error:", error);
    } finally {
      this.isRunning = false;
      console.log("=====================================================\n");
    }
  }

  // ======================================================
  // CORE LOGIC
  // ======================================================
  async checkStudent(student) {
    console.log(`\nChecking student exams: ${student.fullName}`);

    const requiredCourses = await productCourse.findAll({
      where: { productId: student.productId },
      attributes: ["courseId"],
    });

    if (!requiredCourses.length) {
      console.log("Product has no courses");
      return;
    }

    const requiredCourseIds = requiredCourses.map((c) => c.courseId);

    const exams = await examReservation.findAll({
      where: {
        userId: student.userId,
        reservationStatus: "success",
      },
      include: [
        {
          model: exam,
          attributes: ["examId", "courseId"],
        },
      ],
    });

    if (!exams.length) {
      console.log("Student has no successful exams");
      return;
    }

    const passedCourses = new Set();

    for (const ex of exams) {
      if (ex.exam && ex.exam.courseId) {
        passedCourses.add(ex.exam.courseId);
      }
    }

    const allPassed = requiredCourseIds.every((courseId) =>
      passedCourses.has(courseId),
    );

    if (!allPassed) {
      console.log("Student didn't pass all exams");
      return;
    }

    console.log("All exams passed ✔");

    await Student.update(
      { status: "finished_exam" },
      { where: { userId: student.userId } },
    );

    console.log(`STUDENT GRADUATED: ${student.fullName}`);
  }

  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      console.log("🛑 Finish Student Program Service stopped");
    }
  }
}

const service = new FinishStudentProgramService();

module.exports = {
  name: "FinishStudentProgramService",
  init: () => service.init(),
  stop: () => service.stop(),
};
