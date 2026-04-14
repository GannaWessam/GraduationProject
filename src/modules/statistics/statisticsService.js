const { Op } = require("sequelize");
const { Student } = require("../../models");
const { course, exam } = require("../../models");

// ================= GET STATS =================
async function getStudentsStats() {
  const successCount = await Student.count({
    where: { status: "succeeded" },
  });

  const failedCount = await Student.count({
    where: { status: "failed" },
  });

  const TraineesCount = await Student.count({
    where: {
        [Op.or]: [
          { status: { [Op.ne]: "PENDING" } },
        ],
      },
  });


  const egyptianCount = await Student.count({
    where: { nationality: "Egyptian" },
  });

  const otherCount = await Student.count({
    where: {
      [Op.or]: [
        { nationality: { [Op.ne]: "Egyptian" } },
        { nationality: null },
      ],
    },
  });

  return {
    success: successCount,
    failed: failedCount,
    egyptian: egyptianCount,
    other: otherCount,
    Trainees:TraineesCount,
  };
}
async function getCoursesAndExamsStats() {
    // count courses
    const coursesCount = await course.count();
  
    // count completed exams
    const completedExamsCount = await exam.count({
        where: {
          date: {
            [Op.lt]: new Date(), 
          },
        },
      });
    return {
      courses: coursesCount,
      completedExams: completedExamsCount,
    };
  }


module.exports = {
  getStudentsStats,
  getCoursesAndExamsStats
};