const { Op } = require("sequelize");
const {
  examReservation,
  exam,
  course,
  Student,
  examReservationArchive,
} = require("../../models");
const PaginatedResponse = require("../../Util/PaginatedResponse");

const getAllReservationsByEvent = async (eventId, features) => {
  try {
    const page = Number(features.page) || 1;
    const limit = Number(features.limit) || 10;
    const offset = (page - 1) * limit;

    const searchQuery = features.searchQuery?.search || "";
    const searchFields = features.searchQuery?.searchFields?.split(",") || [];
    const courseTitleFilter = features.options?.where?.["course.title"];

    const buildIncludes = () => {
      const examInclude = {
        model: exam,
        required: true,
        where: { eventId },
        attributes: ["examId", "date", "place", "eventId"],
        include: [
          {
            model: course,
            attributes: ["courseId", "name", "title"],
            ...(courseTitleFilter && {
              where: { title: { [Op.iLike]: `%${courseTitleFilter}%` } },
            }),
          },
        ],
      };

      const studentInclude = {
        model: Student,
        attributes: ["userId", "fullName", "NameEn", "nationalId"],
      };

      if (searchFields.includes("Student.nationalId") && searchQuery) {
        studentInclude.where = {
          nationalId: { [Op.iLike]: `%${searchQuery}%` },
        };
      }

      return [examInclude, studentInclude];
    };

    // fetch all matching rows (no limit/offset here)
    const [normal, archives] = await Promise.all([
      examReservation.findAll({
        attributes: ["createdAt", "attempts", "result", "reservationStatus"],
        include: buildIncludes(),
        order: [["createdAt", "DESC"]],
        subQuery: false,
      }),
      examReservationArchive.findAll({
        attributes: ["archivedAt", "attempts", "result", "reservationStatus"],
        include: buildIncludes().map((inc) => ({ ...inc, as: inc.model.name })),
        order: [["archivedAt", "DESC"]],
        subQuery: false,
      }),
    ]);

    // normalize archive date
    const archiveRows = archives.map((a) => {
      const obj = a.toJSON();
      obj.createdAt = obj.archivedAt;
      delete obj.archivedAt;
      return obj;
    });

    // merge all
    const merged = [...normal.map((r) => r.toJSON()), ...archiveRows];

    // sort by date descending
    merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // apply pagination **after merging**
    const finalRows = merged.slice(offset, offset + limit);

    return PaginatedResponse.fromApiFeature(
      features,
      merged.length, // total count is from merged array
      finalRows,
      "Reservations fetched successfully by event"
    );
  } catch (error) {
    console.error(error);
    throw new Error("failed_to_fetch_reservations_by_event");
  }
};

const getReservationsByUserId = async (userId, features) => {
  try {
    const page = features.page * 1 || 1;
    const limit = features.limit * 1 || 10;
    const offset = (page - 1) * limit;

    const normalRows = await examReservation.findAll({
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
              where: features.options?.where?.["course.title"]
                ? { title: { [Op.iLike]: `%${features.options.where["course.title"]}%` } }
                : undefined,
            },
          ],
        },
        {
          model: Student,
          attributes: ["userId", "fullName", "NameEn", "nationalId"],
          where: features.options?.where?.["Student.nationalId"]
            ? { nationalId: { [Op.iLike]: `%${features.options.where["Student.nationalId"]}%` } }
            : undefined,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const archives = await examReservationArchive.findAll({
      attributes: {
        exclude: [
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
          as: "exam",
          attributes: ["examId", "date", "place"],
          include: [
            {
              model: course,
              attributes: ["courseId", "name", "title"],
              where: features.options?.where?.["course.title"]
                ? { title: { [Op.iLike]: `%${features.options.where["course.title"]}%` } }
                : undefined,
            },
          ],
        },
        {
          model: Student,
          as: "Student",
          attributes: ["userId", "fullName", "NameEn", "nationalId"],
          where: features.options?.where?.["Student.nationalId"]
            ? { nationalId: { [Op.iLike]: `%${features.options.where["Student.nationalId"]}%` } }
            : undefined,
        },
      ],
    });

    const archiveRows = archives.map((a) => {
      const obj = a.toJSON();
      obj.createdAt = a.archivedAt; 
      return obj;
    });

    const merged = [...normalRows.map((r) => r.toJSON()), ...archiveRows];

    merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const paginatedRows = merged.slice(offset, offset + limit);

    return PaginatedResponse.fromApiFeature(
      features,
      merged.length,
      paginatedRows,
      "Reservations fetched successfully by user"
    );
  } catch (error) {
    console.error(error);
    throw new Error("failed_to_fetch_reservations_by_user");
  }
};

module.exports = {
  getAllReservationsByEvent,
  getReservationsByUserId,
};