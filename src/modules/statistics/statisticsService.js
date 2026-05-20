const { Op, fn, col } = require("sequelize");
const { Student } = require("../../models");
const { course, exam,Payment ,training ,event ,reservation , examReservation} = require("../../models");

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
      updatedAt: {
        [Op.between]: [startOfDay, endOfDay]
      },
      status: 'PAID'
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

async function getTrainerTrainings(trainerId) {

    const trainings = await training.findAll({
      where: { trainerId },
      include: [{ model: event , as: 'event', required: true,}]
    });
    
    let current = 0;
    let upcoming = 0;
    
    const today = new Date();
    
    trainings.forEach(t => {
      const e = t.event;
    
      if (e.startDate <= today && e.endDate >= today) current++;
      else if (e.startDate > today) upcoming++;
    });
    
    return {
      currentCount: current,
      upcomingCount: upcoming,
      totalCount: trainings.length
    };
  }

async function getTrainerStudentsCount(trainerId) {
    const count = await reservation.count({
      distinct: true,           
      col: 'reservationId',
      include: [
        {
          model: event,
          as: "reservationEvent",
          required: true,
          include: [
            {
              model: training,
              as: "trainings",
              required: true,
              where: { trainerId }
            }
          ]
        }
      ]
    });
  
    return count;
  }
  
async function getSupervisorExamStats(supervisorId) {
    const today = new Date();
  
  
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
  

    const totalExams = await exam.count({
      where: { supervisorId }
    });
  

    const todayExams = await exam.count({
      where: { supervisorId },
      distinct: true,
      include: [
        {
          model: event,
          where: {
            status: "opend"
          }
        }
      ]
    });
  
  
    const finishedExams = await exam.count({
      where: {
        supervisorId,
        date: {
          [Op.lt]: startOfDay
        }
      }
    });
  
    const finishedPercentage =
      totalExams === 0 ? 0 : (finishedExams / totalExams) * 100;
  
    const closedEventExams = await exam.count({
      where: { supervisorId },
      include: [
        {
          model: event,
          where: {
            status: "closed"
          }
        }
      ]
    });

    const studentsInExams = await examReservation.count({
      include: [
        {
          model: exam,
          where: { supervisorId },
          attributes: [],
        },
      ],
      distinct: true,
      col: "userId",
    });
  
    return {
      totalExams,
      todayExams,
      finishedExams,
      finishedPercentage: Number(finishedPercentage.toFixed(2)),
      closedEventExams,
      studentsInExams
    };
  }

module.exports = {
  getStudentsStats,
  getCoursesAndExamsStats,
  getTrainerTrainings,
  getTrainerStudentsCount,
  getSupervisorExamStats
};