// const { Op } = require("sequelize");
// const { Product, event, package, packageCourse, productCourse: ProductCourse, studentCourse } = require("../../../../models");

// async function getAvailableEventsForUser(userId, productId) {

//     // ✅ هنجمع الـ events اللي هتعدي كل الشروط
//     const filteredEvents = [];

//     // 🧩 هات بيانات الـ product علشان نعرف عدد الكورسات المطلوبة
//     const product = await Product.findByPk(productId);
//     if (!product) throw new Error("Product not found");

//     // 🧩 هات كل الكورسات المرتبطة بالـ product
//     const productCourses = await ProductCourse.findAll({ where: { productId } });

//     // 🧩 احسب عدد الكورسات الإلزامية (mandatory)
//     const mandatoryCourses = productCourses.filter(pc => pc.status === "true").length;
//     const optionalAllowed = product.requirdCourses - mandatoryCourses;

//     // console.log("\n\n\n\n\n\n",mandatoryCourses,optionalAllowed,"\n\n\n\n\n\n");

//     // 🧩 هات الكورسات اللي المستخدم خلصها
//     const doneCourses = await studentCourse.findAll({
//       where: {
//         userId,
//         trainingStatus: "done"
//       },
//       attributes: ["courseId"]
//     });
//     const doneCourseIds = doneCourses.map(c => c.courseId);

//     // 🧩 هات كل الأحداث (events) اللي حالتها مفتوحة والباقة فيها packageId مش null
//     const events = await event.findAll({
//       where: {
//         status: "opend",
//         productId,
//         packageId: { [Op.ne]: null }
//       },
//       include: [
//         {
//           model: package,
//           include: [
//             {
//               model: packageCourse,
//               attributes: ["courseId"]
//             }
//           ]
//         }
//       ]
//     });
//       console.log("\n\n\n\n\n\n",events.length,"\n\n\n\n\n\n");

//     // 🧩 فلترة الـ events بناءً على الشروط
//     for (const event of events) {
//       const packageCourses = event.package?.packageCourses || [];
//       const packageCourseIds = packageCourses.map(pc => pc.courseId);

//       // ❌ لو المستخدم خلص أي كورس من كورسات الباقة => استبعد الباقة
//       const userDidAnyCourseInPackage = doneCourseIds.some(id => packageCourseIds.includes(id));
//       if (userDidAnyCourseInPackage) continue;

//       // ✅ اجمع الكورسات الإجمالية (اللي خلصها + اللي في الباقة)
//       const totalCoursesCount = doneCourseIds.length + packageCourseIds.length;

//       // ✅ الشرط الأول: العدد الإجمالي ≤ المسموح
//       if (totalCoursesCount <= product.requirdCourses) {

//         // 🟩 الكورسات الاختيارية كلها في الـ product
//         const optionalProductCourses = productCourses.filter(pc => pc.status === "false");

//         // 🟩 الكورسات الاختيارية اللي المستخدم خلصها
//         const doneOptionalCourses = optionalProductCourses.filter(pc => doneCourseIds.includes(pc.courseId));

//         // 🟩 الكورسات الاختيارية في الباقة الحالية
//         const packageOptionalCourses = optionalProductCourses.filter(pc => packageCourseIds.includes(pc.courseId));

//         // 🧮 المجموع الكلي للكورسات الاختيارية
//         const totalOptional = doneOptionalCourses.length + packageOptionalCourses.length;

//         // ✅ الشرط الثاني: عدد الاختيارية ≤ المسموح
//         if (totalOptional <= optionalAllowed) {
//           filteredEvents.push(event);
//         }
//       }
//     }

//     return filteredEvents;
//   }

//   module.exports = { getAvailableEventsForUser };

//------------------------------------------------------------------
//
//---------------------------------------------------------------------------

// const { Op } = require("sequelize");
// const {
//   Product,
//   event,
//   package: Package,
//   packageCourse,
//   productCourse: ProductCourse,
//   studentCourse,
// } = require("../../../../models");

// async function getAvailableEventsForUser(userId, productId) {
//   const product = await Product.findByPk(productId);
//   if (!product) throw new Error("Product not found");

//   const productCourses = await ProductCourse.findAll({ where: { productId } });
//   const mandatoryCourses = productCourses
//     .filter((pc) => pc.status === "true")
//     .map((pc) => pc.courseId);
//   const optionalCourses = productCourses
//     .filter((pc) => pc.status === "false")
//     .map((pc) => pc.courseId);

//   const requiredTotal = product.requirdCourses;
//   const mandatoryCount = mandatoryCourses.length;
//   const optionalAllowed = requiredTotal - mandatoryCount;

//   const studentCourses = await studentCourse.findAll({
//     where: { userId },
//     attributes: ["courseId", "trainingStatus", "examStatus"],
//   });

//   const doneCourses = [];
//   const allowedForTraining = [];
//   const allowedForExam = [];

//   for (const sc of studentCourses) {
//     const { courseId, trainingStatus, examStatus } = sc;

//     if (trainingStatus === "none" && examStatus === "none") continue;

//     if (trainingStatus === "done" && examStatus === "done") {
//       doneCourses.push(courseId);
//     }

//     if (trainingStatus === "pending" && examStatus === "none") {
//       allowedForTraining.push(courseId);
//     }

//     else if (trainingStatus === "pending" && examStatus === "pending") {
//       allowedForTraining.push(courseId);
//     }

//     else if (trainingStatus === "done" && examStatus === "pending") {
//       allowedForExam.push(courseId);
//     }

//     else if (trainingStatus === "pending" && examStatus === "done") {
//       continue;
//     }

//   }

//   const events = await event.findAll({
//     where: {
//       status: "opend",
//       productId,
//       packageId: { [Op.ne]: null },
//     },
//     include: [
//       {
//         model: Package,
//         include: [
//           {
//             model: packageCourse,
//             attributes: ["courseId"],
//           },
//         ],
//       },
//     ],
//   });

//   const filteredEvents = [];

//   for (const ev of events) {
//     const packageCourses = ev.package?.packageCourses || [];
//     const packageCourseIds = packageCourses.map((pc) => pc.courseId);

//     console.log("\n==============================");
//     console.log("Event:", ev.eventName, ev.eventId, "Type:", ev.type);
//     console.log("Package courses:", packageCourseIds);
//     console.log("Done:", doneCourses);
//     console.log("Allowed for Training:", allowedForTraining);
//     console.log("Allowed for Exam:", allowedForExam);

//     if (packageCourseIds.some((id) => doneCourses.includes(id))) {
//       console.log("Skipped: contains done course");
//       continue;
//     }

//     if (ev.type === "training") {
//       if (!packageCourseIds.some((id) => allowedForTraining.includes(id))) {
//         console.log("Skipped: not allowed for training");
//         continue;
//       }
//     }

//     if (ev.type === "exam") {

//       const allReadyForExam = packageCourseIds.every((id) =>
//         allowedForExam.includes(id)
//       );

//       if (!allReadyForExam) {
//         console.log("Skipped: some courses not ready for exam");
//         continue;
//       }
//     }

//     const totalAfter = new Set([...doneCourses, ...packageCourseIds]).size;
//     if (totalAfter > requiredTotal) {
//       console.log(`Skipped: exceeds requiredCourses (${requiredTotal})`);
//       continue;
//     }

//     const doneOptionalCount = doneCourses.filter((id) =>
//       optionalCourses.includes(id)
//     ).length;
//     const packageOptionalCount = packageCourseIds.filter((id) =>
//       optionalCourses.includes(id)
//     ).length;
//     const optionalAfter = doneOptionalCount + packageOptionalCount;
//     if (optionalAfter > optionalAllowed) {
//       console.log(
//         `Skipped: too many optional (${optionalAfter}/${optionalAllowed})`
//       );
//       continue;
//     }

//     const includesMandatory = packageCourseIds.some((id) =>
//       mandatoryCourses.includes(id)
//     );
//     const includesOptional = packageCourseIds.some((id) =>
//       optionalCourses.includes(id)
//     );

//     if (includesMandatory || includesOptional) {
//       console.log("Accepted:", ev.eventName);
//       filteredEvents.push(ev);
//     } else {
//       console.log("Skipped: no valid mandatory/optional");
//     }
//   }

//   return filteredEvents;
// }

// module.exports = { getAvailableEventsForUser };

//--------------------------------------------------------
// const { Op } = require("sequelize");
// const {
//   Product,
//   event,
//   package: Package,
//   packageCourse,
//   productCourse: ProductCourse,
//   studentCourse,
// } = require("../../../../models");

// // =========================
// // 🔹 MAIN ENTRY FUNCTION
// // =========================

// async function getAvailableEventsForUser(userId, productId) {
//   const product = await getProductById(productId);
//   const { mandatoryCourses, optionalCourses, requiredTotal, optionalAllowed } =
//     await getProductCourseRules(productId, product.requirdCourses);

//   const { doneCourses, allowedForTraining, allowedForExam } =
//     await getStudentCourseStatus(userId);

//   const events = await getAllOpenEvents(productId);

//   return filterEligibleEvents(
//     events,
//     mandatoryCourses,
//     optionalCourses,
//     doneCourses,
//     allowedForTraining,
//     allowedForExam,
//     requiredTotal,
//     optionalAllowed
//   );
// }

// // =========================
// // 🔹 PRODUCT HELPERS
// // =========================
// async function getProductById(productId) {
//   const product = await Product.findByPk(productId);
//   if (!product) throw new Error("Product not found");
//   return product;
// }

// async function getProductCourseRules(productId, requiredTotal) {
//   const productCourses = await ProductCourse.findAll({ where: { productId } });

//   const mandatoryCourses = [];
//   const optionalCourses = [];

//   for (const pc of productCourses) {
//     if (pc.status === "true") mandatoryCourses.push(pc.courseId);
//     else optionalCourses.push(pc.courseId);
//   }

//   const mandatoryCount = mandatoryCourses.length;
//   const optionalAllowed = requiredTotal - mandatoryCount;

//   return { mandatoryCourses, optionalCourses, requiredTotal, optionalAllowed };
// }

// // =========================
// // 🔹 STUDENT COURSE HELPERS
// // =========================
// async function getStudentCourseStatus(userId) {
//   const studentCourses = await studentCourse.findAll({
//     where: { userId },
//     attributes: ["courseId", "trainingStatus", "examStatus"],
//   });

//   const doneCourses = [];
//   const allowedForTraining = [];
//   const allowedForExam = [];

//   for (const sc of studentCourses) {
//     const { courseId, trainingStatus, examStatus } = sc;

//     if (trainingStatus === "none" && examStatus === "none") continue;

//     if (trainingStatus === "done" && examStatus === "done") {
//       doneCourses.push(courseId);
//       continue;
//     }

//     if (trainingStatus === "pending") {

//       allowedForTraining.push(courseId);
//       continue;
//     }

//     if (trainingStatus === "done" && examStatus === "pending") {
//       allowedForExam.push(courseId);
//       continue;
//     }
//   }

//   return { doneCourses, allowedForTraining, allowedForExam };
// }

// // =========================
// // 🔹 EVENT HELPERS
// // =========================

// async function getAllOpenEvents(productId) {
//   return event.findAll({
//     where: {
//       status: "opend",
//       productId,
//       packageId: { [Op.ne]: null },
//     },
//     include: [
//       {
//         model: Package,
//         include: [{ model: packageCourse, attributes: ["courseId"] }],
//       },
//     ],
//   });
// }

// // =========================
// // 🔹 FILTER LOGIC
// // =========================
// function filterEligibleEvents(
//   events,
//   mandatoryCourses,
//   optionalCourses,
//   doneCourses,
//   allowedForTraining,
//   allowedForExam,
//   requiredTotal,
//   optionalAllowed
// ) {
//   const filtered = [];

//   for (const ev of events) {
//     const packageCourseIds = ev.package?.packageCourses?.map((pc) => pc.courseId) || [];

//     if (shouldSkipEvent(ev, packageCourseIds, doneCourses, allowedForTraining, allowedForExam, requiredTotal, optionalCourses, optionalAllowed))
//       continue;

//     filtered.push(ev);
//   }

//   return filtered;
// }

// // =========================
// // 🔹 SKIP DECISION LOGIC
// // =========================
// function shouldSkipEvent(
//   ev,
//   packageCourseIds,
//   doneCourses,
//   allowedForTraining,
//   allowedForExam,
//   requiredTotal,
//   optionalCourses,
//   optionalAllowed
// ) {

//   if (packageCourseIds.some((id) => doneCourses.includes(id))) return true;

//   if (ev.type === "training" && !packageCourseIds.some((id) => allowedForTraining.includes(id)))
//     return true;

//   if (ev.type === "exam" && !packageCourseIds.every((id) => allowedForExam.includes(id)))
//     return true;

//   const totalAfter = new Set([...doneCourses, ...packageCourseIds]).size;
//   if (totalAfter > requiredTotal) return true;

//   const doneOptionalCount = doneCourses.filter((id) => optionalCourses.includes(id)).length;
//   const packageOptionalCount = packageCourseIds.filter((id) =>
//     optionalCourses.includes(id)
//   ).length;
//   const optionalAfter = doneOptionalCount + packageOptionalCount;
//   if (optionalAfter > optionalAllowed) return true;

//   return false;
// }

// module.exports = { getAvailableEventsForUser };
//--------------------------------------------------------------------------------
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
} = require("../../../../models");

//bfkr a3ml 3leha endpoint?
async function getAvailableEventsForUser(userId, productId, query) {
  const product = await getProductById(productId);
  const { mandatoryCourses, optionalCourses, requiredTotal, optionalAllowed } =
    await getProductCourseRules(productId, product.requirdCourses);

  const { doneCourses, allowedForTraining, allowedForExam } =
    await getStudentCourseStatus(userId);

  // Get student's StudyLan to filter events by language
  const student = await Student.findOne({
    where: { userId },
    attributes: ["StudyLan"],
  });

  if (!student) {
    throw new Error("Student not found");
  }

  const events = await getAllOpenEvents(productId, query, student.StudyLan);

  return filterEligibleEvents(
    events,
    mandatoryCourses,
    optionalCourses,
    doneCourses,
    allowedForTraining,
    allowedForExam,
    requiredTotal,
    optionalAllowed,
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
    attributes: ["courseId", "trainingStatus", "examStatus"],
  });

  const doneCourses = [];
  const allowedForTraining = [];
  const allowedForExam = [];

  for (const sc of studentCourses) {
    const { courseId, trainingStatus, examStatus } = sc;

    if (trainingStatus === "none" && examStatus === "none") continue;

    if (trainingStatus === "done" && examStatus === "done") {
      doneCourses.push(courseId);
      continue;
    }

    if (trainingStatus === "pending") {
      allowedForTraining.push(courseId);
      continue;
    }

    if (trainingStatus === "done" && examStatus === "pending") {
      allowedForExam.push(courseId);
      continue;
    }
  }

  return { doneCourses, allowedForTraining, allowedForExam };
}

const ApiFeature = require("../../../../Util/ApiFeatures");

async function getAllOpenEvents(productId, query, language = null) {
  const apiFeature = new ApiFeature(query)
    .filter()
    .pagination()
    .sort()
    .selectedFields();

  apiFeature.options.where = {
    ...apiFeature.options.where,
    status: "opend",
    productId,
    startDateRes: { [Op.lte]: new Date() },
    endDateRes: { [Op.gte]: new Date() },
  };

  if (language) {
    apiFeature.options.where.language = language;
  }

  return event.findAll({
    ...apiFeature.options,
    include: [
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
) {
  const filtered = [];

  for (const ev of events) {
    const packageCourseIds =
      ev.package?.packageCourses?.map((pc) => pc.courseId) || [];

    const eventCourseIds =
      ev.packageId == null && ev.courseId ? [ev.courseId] : packageCourseIds;

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
) {
  if (courseIds.some((id) => doneCourses.includes(id))) return true;

  if (
    ev.type === "training" &&
    !courseIds.some((id) => allowedForTraining.includes(id))
  )
    return true;

  if (
    ev.type === "exam" &&
    !courseIds.every((id) => allowedForExam.includes(id))
  )
    return true;

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

  const finalGroupMembers = [...new Set([...staffIds, ...userIds])];

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
