const {
  examReservation,
  examReservationArchive,
} = require("../../../../models");

const checkStudentEligibility = async (userId, t) => {
  const current = await examReservation.findAll({
    where: { userId },
    attributes: ["result", "reservationStatus"],
    transaction: t,
    raw: true,
  });

  const archived = await examReservationArchive.findAll({
    where: { userId },
    attributes: ["result", "reservationStatus"],
    transaction: t,
    raw: true,
  });

  const allAttempts = [...current, ...archived];

  if (allAttempts.length === 0) return true;

  const hasFailure = allAttempts.some(
    (a) =>
      a.reservationStatus === "failed" ||
      (a.result !== null && a.result < 65)
  );

  return hasFailure;
};

module.exports = checkStudentEligibility;