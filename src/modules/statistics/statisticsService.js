const { Op, fn, col } = require("sequelize");
const { Student } = require("../../models");
const { course, exam,Payment } = require("../../models");

// ================= GET STATS =================

async function getTodayTotalPayments() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const result = await Payment.findOne({
    attributes: [
      [fn('SUM', col('actualAmount')), 'total']
    ],
    where: {
      timestamp: {
        [Op.between]: [startOfDay, endOfDay]
      },
      status: 'SUCCESS'
    },
    raw: true
  });

  return result.total || 0;
}


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
    where: { nationality: "Egyptian | مصري" },
  });

  const otherCount = await Student.count({
    where: {
      [Op.or]: [
        { nationality: { [Op.ne]: "Egyptian | مصري" } },
        { nationality: null },
      ],
    },
  });

  const todayPayments=await getTodayTotalPayments()

  return {
    success: successCount,
    failed: failedCount,
    egyptian: egyptianCount,
    other: otherCount,
    Trainees:TraineesCount,
    todayPayments:todayPayments
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