const {
  examReservation,
  exam,
  course,
  User,
  Student,
  Reexam,
  Payment,
  efada,
  systemdata
} = require("../../models");
const PaginatedResponse = require("../../Util/PaginatedResponse");

const getAllReservationsByEvent = async (eventId, features) => {
  try {
    const opts = { ...(features.options || {}) };

    const queryOptions = {
      attributes: {
        exclude: [
          "createdAt",
          "updatedAt",
          "examReservationId",
          "reservationId",
          "userId",
          "examId",
          "type",
        ],
      },
      include: [
        {
          model: exam,
          required: true,
          where: { eventId },
          attributes: ["examId", "date", "place"],
          include: [
            {
              model: course,
              attributes: ["courseId", "name", "title"],
            },
          ],
        },
        {
          model: Student,
          attributes: ["userId", "fullName","NameEn","nationalId"],
        },
      ],
      where: opts.where || {},
      order: opts.order || [["createdAt", "DESC"]],
      limit: opts.limit,
      offset: opts.offset,
      distinct: true,
    };

    const { count, rows } = await examReservation.findAndCountAll(queryOptions);

    return PaginatedResponse.fromApiFeature(
      features,
      count,
      rows,
      "Reservations fetched successfully by event",
    );
  } catch (error) {
    // console.log(error);
    
    throw new Error("failed_to_fetch_reservations_by_event");
  }
};

const getReservationsByUserId = async (userId, features) => {
  const page = features.page * 1 || 1;
  const limit = features.limit * 1 || 10;
  const offset = (page - 1) * limit;

  // 1️⃣ نفس الكويري بالظبط
  const { count, rows } = await examReservation.findAndCountAll({
    attributes: {
      exclude: [
        "createdAt",
        "updatedAt",
        "examReservationId",
        "reservationId",
        "userId",
        "examId",
        "type",
      ],
    },
    where: { userId },
    limit,
    offset,
    include: [
      {
        model: exam,
        attributes: ["examId", "date", "place"],
        include: [
          {
            model: course,
            attributes: ["courseId", "name", "title"],
          },
        ],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  // 2️⃣ نجيب examIds من الصفحة
  const examIds = rows.map((row) => row.exam?.examId).filter(Boolean);

  let paidExamSet = new Set();

  if (examIds.length > 0) {
    // 3️⃣ نعمل Query واحدة بس على ReexamRequest + Payment
    const paidReexams = await Reexam.findAll({
      attributes: ["examId"],
      where: {
        userId,
        examId: examIds,
      },
      include: [
        {
          model: Payment,
          required: true,
          attributes: [],
        },
      ],
      raw: true,
    });

    paidExamSet = new Set(paidReexams.map((r) => r.examId));
  }

  const userEfada = await efada.findOne({
    where: { userId },
    attributes: ["efadaId"],
  });
  const sd = await systemdata.findOne();
  
  let hasEfada=true
  if(userEfada)
    hasEfada=true
  else if(sd.serviceStatus === "Activated")
    hasEfada=false

  
  const formattedRows = rows.map((row) => {
    const data = row.toJSON();

    return {
      ...data,
      hasPaidReexam: paidExamSet.has(data.exam.examId),
    };
  });

  const data = {formattedRows , hasEfada : hasEfada}

  return PaginatedResponse.fromApiFeature(
    features,
    count,
    data,
    "grades fetched successfully"
  );
};

module.exports = {
  getAllReservationsByEvent,
  getReservationsByUserId,
};