const {
  examReservation,
  exam,
  course,
  User,
  Student,
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

const getReservationsByUserId = async (userId) => {
  return await examReservation.findAll({
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
      {
        model: Student,
        attributes: ["userId", "fullName"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });
};

module.exports = {
  getAllReservationsByEvent,
  getReservationsByUserId,
};
