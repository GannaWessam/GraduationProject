const { examReservation, exam, course, User ,Student } = require("../../models");
const PaginatedResponse = require("../../Util/PaginatedResponse");



const getAllReservations = async (features) => {
  try {
    const opts = { ...(features.options || {}) };

    const queryOptions = {
      include: [
        {
          model: exam,
          attributes: ["examId", "date", "place"],
          include: [
            {
              model: course,
              attributes: ["courseId", "name", "title"]
            }
          ]
        },
        {
          model: Student,
          attributes: ["userId", "fullName"]
        }
      ],
      where: opts.where || {},
      order: opts.order || [["createdAt", "DESC"]],
      limit: opts.limit,
      offset: opts.offset,
      attributes: opts.attributes,
      distinct: true
    };

    const { count, rows } =
      await examReservation.findAndCountAll(queryOptions);

    return PaginatedResponse.fromApiFeature(
      features,
      count,
      rows,
      "Reservations fetched successfully"
    );

  } catch (error) {
    throw new Error("failed_to_fetch_reservations");
  }
};

  
  

  const getReservationsByUserId = async (userId) => {
    return await examReservation.findAll({
      where: { userId },
      include: [
        {
          model: exam,
          attributes: ["examId", "date", "place"],
          include: [
            {
              model: course,
              attributes: ["courseId", "name", "title"]
            }
          ]
        },
        {
          model: Student,
          attributes: ["userId", "fullName"]
        }
      ],
      order: [["createdAt", "DESC"]],
    });
  };
  
  
  module.exports = {
    getAllReservations,
    getReservationsByUserId,
  };