const { Op } = require("sequelize");
const {
  Product,
  event,
  package: Package,
  packageCourse,
  productCourse: ProductCourse,
  studentCourse,
  training,
  trainer,
  User,
  exam,
  supervisor,
  reservation,
  Student,
  examReservation,
  examReservationArchive,
  course,
  UserPermission,
  Permission,
} = require("../../../../models");

//bfkr a3ml 3leha endpoint?
async function getAvailableEventsForUser(userId, productId, query ,isSuperAdmin) {
  const product = await getProductById(productId);
  const { mandatoryCourses, optionalCourses, requiredTotal, optionalAllowed } =
    await getProductCourseRules(productId, product.requirdCourses);

  const { doneCourses, allowedForTraining, allowedForExam , retryCourses} =
    await getStudentCourseStatus(userId);

  // Get student's StudyLan to filter events by language
  const student = await Student.findOne({
    where: { userId },
    attributes: ["StudyLan"], 
  });

  if (!student) {
    throw new Error("Student not found");
  }

  const events = await getAllOpenEvents(
    productId,
    query,
    student.StudyLan,
    userId,
    isSuperAdmin
  );

  return filterEligibleEvents(
    events,
    mandatoryCourses,
    optionalCourses,
    doneCourses,
    allowedForTraining,
    allowedForExam,
    requiredTotal,
    optionalAllowed,
    retryCourses
  );
}

async function getProductById(productId) {
  const product = await Product.findByPk(productId);
  if (!product) throw new Error("Product not found");
  return product;
}

async function getProductCourseRules(productId, requiredTotal) {
  const productCourses = await ProductCourse.findAll({ where: { productId } });

  const mandatoryCourses = [];
  const optionalCourses = [];

  for (const pc of productCourses) {
    if (pc.status === "true") mandatoryCourses.push(pc.courseId);
    else optionalCourses.push(pc.courseId);
  }

  const mandatoryCount = mandatoryCourses.length;
  const optionalAllowed = requiredTotal - mandatoryCount;

  return { mandatoryCourses, optionalCourses, requiredTotal, optionalAllowed };
}

async function getStudentCourseStatus(userId) {
  const studentCourses = await studentCourse.findAll({
    where: { userId },
    attributes: ["courseId", "trainingStatus", "examStatus","attempts"],
    lock: false,
    raw: true,
  });
  const doneCourses = [];
  const allowedForTraining = [];
  const allowedForExam = [];
  const retryCourses=[]

  for (const sc of studentCourses) {
    const { courseId, trainingStatus, examStatus,attempts } = sc;

    if (trainingStatus === "none" && examStatus === "none") continue;

    if ((trainingStatus === "done" || trainingStatus === null) && (examStatus === "done" || examStatus === "sucess")) {
      doneCourses.push(courseId);
      console.log("\n\n\n\n\n\n\n\n\n\n\nTest\n\n\n\n\n\n\n\n\n");

      continue;
    }

    if (trainingStatus === "pending") {
      allowedForTraining.push(courseId);
      continue;
    }

    if ((trainingStatus === "done" || trainingStatus === null) && examStatus === "pending") {
      allowedForExam.push(courseId);
      if(attempts>0)
      {
        retryCourses.push(courseId)
      }
      continue;
    }
  }

  return { doneCourses, allowedForTraining, allowedForExam ,retryCourses};
}

const ApiFeature = require("../../../../Util/ApiFeatures");

async function getAllOpenEvents(productId, query, language = null, userId ,isSuperAdmin) {
  const apiFeature = new ApiFeature(query)
    .filter()
    .pagination()
    .sort()
    .selectedFields();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  apiFeature.options.where = {
    ...apiFeature.options.where,
    productId,
  };

  if (language) {
    apiFeature.options.where.language = language;
  }

  if (!isSuperAdmin) {
    apiFeature.options.where.status = "opend";
    apiFeature.options.where.startDateRes = { [Op.lte]: endOfToday };
    apiFeature.options.where.endDateRes = { [Op.gte]: startOfToday };
  } else {
    apiFeature.options.where.startDate={ [Op.gte]: endOfToday };
    console.log(apiFeature.options);
    console.log("--------------------");
    console.log(endOfToday);
    
    
    
  }

  return event.findAll({
    ...apiFeature.options,
    include: [
      {
        model: reservation,
        required: false,
        where: { userId },
        include: [
          {
            model: examReservation,
            required: false,
            attributes: [
              "reservationStatus",
              "result",
              "attempts",
              "createdAt",
            ],
          },
        ],
      },
      {
        model: Package,
        required: false,
        include: [{ model: packageCourse, attributes: ["courseId"] }],
      },
      {
        model: training,
        as: "trainings",
        required: false,
        include: [
          {
            model: trainer,
            as: "trainer",
            attributes: ["Name"],
          },
          {
            model:course,
            attributes:["name"]
          }
        ],
      },
      {
        model: exam,
        required: false,
        include: [
          {
            model: supervisor,
            as: "supervisor",
            attributes: ["Name"],
          },
          {
            model:course,
            attributes:["name"]
          }
        ],
      },
    ],
  });
}

function filterEligibleEvents(
  events,
  mandatoryCourses,
  optionalCourses,
  doneCourses,
  allowedForTraining,
  allowedForExam,
  requiredTotal,
  optionalAllowed,
  retryCourses
) {
  const filtered = [];
  for (const ev of events) {
    const userReservations = ev.reservations || [];
    if (userReservations.length > 0) {
      const latestReservation = userReservations.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      )[0];

      if (ev.type === "exam") {
        const examRes = latestReservation.examReservations?.[0];

        if (!examRes) continue;

        if (
          examRes.reservationStatus !== "failed" &&
          examRes.reservationStatus !== "succeeded"
        )
          continue;

        if (Number(examRes.result) >= 65) continue;

      }
    }
    const packageCourseIds =
      ev.package?.packageCourses?.map((pc) => pc.courseId) || [];

      const eventCourseIds =
      ev.packageId == null
        ? ev.type === "training"
          ? [ev.trainings?.[0]?.courseId]
          : ev.type === "exam"
          ? [ev.exams?.[0]?.courseId]
          : []
        : packageCourseIds;
      
    if (
      shouldSkipEvent(
        ev,
        eventCourseIds,
        doneCourses,
        allowedForTraining,
        allowedForExam,
        requiredTotal,
        optionalCourses,
        optionalAllowed,
        retryCourses
      )
    )
      continue;

    filtered.push(ev);
  }

  return filtered;
}

//?
function shouldSkipEvent(
  ev,
  courseIds,
  doneCourses,
  allowedForTraining,
  allowedForExam,
  requiredTotal,
  optionalCourses,
  optionalAllowed,
  retryCourses
) {
  if (courseIds.some((id) => doneCourses.includes(id))) return true;

  if (
    ev.type === "training" &&
    !courseIds.every((id) => allowedForTraining.includes(id))
  ) {
    return true;
  }

  
  if (
    ev.type === "exam" &&
    !courseIds.every((id) => allowedForExam.includes(id))
  )
    return true;

    if(ev.type === "exam" && !ev.retry && 
      courseIds.some((id) => retryCourses.includes(id))
    )
    {
      return true
    }
    if(ev.type === "exam" && ev.retry && 
      !courseIds.every((id) => retryCourses.includes(id))
    )
    {
      return true
    }
    

  const totalAfter = new Set([...doneCourses, ...courseIds]).size;

  if (totalAfter > requiredTotal) return true;

  const doneOptionalCount = doneCourses.filter((id) =>
    optionalCourses.includes(id),
  ).length;
  const packageOptionalCount = courseIds.filter((id) =>
    optionalCourses.includes(id),
  ).length;
  const optionalAfter = doneOptionalCount + packageOptionalCount;
  if (optionalAfter > optionalAllowed) return true;

  return false;
}

const chattingService = require("../../../../Services/chattingService");

// Handles group chat for both training and exam events.
// Training: group = trainers (from training) + users (from reservation).
// Exam: group = supervisors (from exam) + users (from reservation).
// Optional 4th arg: transaction so calls run in the same transaction.
async function handleCreateGroupChatForEvent(
  eventId,
  eventName,
  eventType,
  transaction = null,
) {
  const tx = transaction ?? undefined;

  const allReservations = await reservation.findAll({
    where: { eventId },
    attributes: ["userId"],
    transaction: tx,
  });

  const userIds = allReservations.map((r) => r.userId);

  let staffIds = [];

  if (eventType === "training") {
    const trainings = await training.findAll({
      where: { eventId },
      attributes: ["trainerId"],
      transaction: tx,
    });
    staffIds = trainings.map((tr) => tr.trainerId).filter((id) => id != null);
  } else if (eventType === "exam") {
    const exams = await exam.findAll({
      where: { eventId },
      attributes: ["supervisorId"],
      transaction: tx,
    });
    staffIds = exams.map((ex) => ex.supervisorId).filter((id) => id != null);
  }
  const admins = await User.findAll({
    where: {
      role: "ADMIN",
    },
    attributes: ["userId"],
    include: [
      {
        model: Permission,
        as: "permissions",
        required: true,
        where: {
          permissionId: process.env.CHAT_PERMISSION_ID,
        },
        attributes: [],
      },
    ],
    transaction: tx,
  });
  const adminUserIds = admins.map(a => a.userId);

  const finalGroupMembers = [...new Set([...staffIds, ...userIds,...adminUserIds])];

  await chattingService.createGroupConversation(
    finalGroupMembers,
    eventId,
    eventName,
  );
}

const archiveReservation = async (reservation, t) => {
  await examReservationArchive.create(
    {
      originalExamReservationId: reservation.examReservationId,
      reservationId: reservation.reservationId,
      userId: reservation.userId,
      examId: reservation.examId,
      type: reservation.type,
      attempts: reservation.attempts,
      result: reservation.result,
      reservationStatus: reservation.reservationStatus,
    },
    { transaction: t },
  );
};
const FIVE_YEARS = 5 * 365 * 24 * 60 * 60 * 1000;

const canRetakeAfterFiveYears = (reservation) => {
  const lastDate = new Date(reservation.createdAt).getTime();
  const now = Date.now();

  return now - lastDate >= FIVE_YEARS;
};

module.exports = {
  getAvailableEventsForUser,
  handleCreateGroupChatForEvent,
  archiveReservation,
  canRetakeAfterFiveYears,
};
