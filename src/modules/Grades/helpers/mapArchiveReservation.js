const { exam, course, Student } = require("../../../models");

const mapArchiveReservations = async (archives) => {
  const mapped = [];

  for (const arc of archives) {

    const examData = await exam.findByPk(arc.examId, {
      attributes: ["examId", "date", "place"],
      include: [
        {
          model: course,
          attributes: ["courseId", "name", "title"],
        },
      ],    
    });

    const student = await Student.findOne({
      where: { userId: arc.userId },
      attributes: ["userId", "fullName", "NameEn", "nationalId"],
    });

    if (!examData) continue;

    mapped.push({
      ...arc.dataValues,

      // emulate examReservation includes
      exam: examData,
      Student: student,

      // make it look like normal reservation
      createdAt: arc.archivedAt,
      updatedAt: arc.archivedAt,
    });
  }

  return mapped;
};

module.exports = mapArchiveReservations;