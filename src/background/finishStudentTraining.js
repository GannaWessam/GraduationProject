const cron = require("node-cron");
const {
  Student,
  productCourse,
  training,
  trainingReservation,
  event,
  User,
} = require("../models");

const { Op } = require("sequelize");

class FinishStudentTrainingService {
  constructor() {
    this.cronJob = null;
    this.isRunning = false;
  }

  init() {
    this.cronJob = cron.schedule(
      "0 2 * * *", // 04:00 AM Egypt time (runs after closeExpiredEvents)
      async () => {
        await this.processStudents();
      },
      {
        scheduled: true,
        timezone: "Africa/Cairo",
      },
    );

    console.log(
      "🎓 Finish Student Training Service initialized - Running daily at 04:00 AM Egypt time",
    );
  }

  async processStudents() {
    if (this.isRunning) {
      console.log("FinishStudentTraining already running... skipping");
      return;
    }

    this.isRunning = true;
    console.log("\n================ STUDENT TRAINING CHECK ================");

    try {
      const students = await Student.findAll({
        where: {
          productId: { [Op.ne]: null },
          status: "reserved Training",
        },
        attributes: ["userId", "fullName", "productId", "status"],
      });

      console.log(`Students to check: ${students.length}`);

      for (const student of students) {
        try {
          await this.checkStudent(student);
        } catch (err) {
          console.error(
            `Error checking student ${student.fullName}:`,
            err.message,
          );
        }
      }
    } catch (error) {
      console.error("Fatal error in FinishStudentTraining:", error);
    } finally {
      this.isRunning = false;
      console.log("========================================================\n");
    }
  }

  async checkStudent(student) {
    console.log(`\nChecking student: ${student.fullName}`);

    // --------------------------------------------------------
    //  REQUIRED COURSES (FROM PRODUCT)
    // --------------------------------------------------------
    const requiredCourses = await productCourse.findAll({
      where: { productId: student.productId },
      attributes: ["courseId"],
    });

    if (!requiredCourses.length) {
      console.log("No required courses for this product");
      return;
    }

    const requiredCourseIds = requiredCourses.map((c) => c.courseId);

    // --------------------------------------------------------
    // GET STUDENT TRAINING RESERVATIONS
    // --------------------------------------------------------
    const reservations = await trainingReservation.findAll({
      where: {
        userId: student.userId,
        reservationStatus: "reserved",
      },
      include: [
        {
          model: training,
          attributes: ["trainingId", "courseId", "eventId"],
        },
      ],
    });

    if (!reservations.length) {
      console.log("Student has no approved training reservations");
      return;
    }

    // --------------------------------------------------------
    // DETERMINE COMPLETED COURSES
    // --------------------------------------------------------
    const completedCourses = new Set();

    for (const res of reservations) {
      if (res.training && res.training.courseId) {
        completedCourses.add(res.training.courseId);
      }
    }

    // --------------------------------------------------------
    //  COMPARE COURSES
    // --------------------------------------------------------
    const allCompleted = requiredCourseIds.every((courseId) =>
      completedCourses.has(courseId),
    );

    if (!allCompleted) {
      console.log("Student did not finish all required courses");
      return;
    }

    console.log("All required courses completed ✔");

    // --------------------------------------------------------
    //  GET RELATED EVENTS
    // --------------------------------------------------------
    const eventIds = reservations
      .map((r) => r.training?.eventId)
      .filter(Boolean);

    if (!eventIds.length) {
      console.log("No events found");
      return;
    }

    const events = await event.findAll({
      where: { eventId: { [Op.in]: eventIds } },
      attributes: ["eventId", "endDate", "eventName"],
    });

    if (!events.length) return;

    // --------------------------------------------------------
    //  FIND LAST EVENT
    // --------------------------------------------------------
    let lastEvent = events[0];

    for (const ev of events) {
      if (new Date(ev.endDate) > new Date(lastEvent.endDate)) {
        lastEvent = ev;
      }
    }

    console.log(
      `Last event: ${lastEvent.eventName} | End Date: ${lastEvent.endDate}`,
    );

    // --------------------------------------------------------
    //  CHECK IF EVENT FINISHED
    // --------------------------------------------------------
    const today = new Date();
    const lastEventEnd = new Date(lastEvent.endDate);

    if (lastEventEnd >= today) {
      console.log("Final event still running");
      return;
    }

    // --------------------------------------------------------
    // UPDATE STUDENT STATUS
    // --------------------------------------------------------
    await Student.update(
      { status: "finished_training" },
      { where: { userId: student.userId } },
    );

    await studentCourse.update(
      { trainingStatus: "done" },
      {
        where: {
          userId: student.userId,
          courseId: {
            [Op.in]: Array.from(completedCourses),
          },
        },
        transaction: t,
      }
    );

    console.log(`🎉 Student graduated automatically: ${student.fullName}`);
    await User.increment("tokenVersion", { where: { userId: student.userId } });
  }

  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      console.log("🛑 Finish Student Training Service stopped");
    }
  }
}

const service = new FinishStudentTrainingService();

module.exports = {
  name: "FinishStudentTrainingService",
  init: () => service.init(),
  stop: () => service.stop(),
};
