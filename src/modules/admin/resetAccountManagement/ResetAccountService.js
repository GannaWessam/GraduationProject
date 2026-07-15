const { sequelize } = require("../../../models");
const { updateStudentAfterReset, createResetPayment, resetOrCreateStudentCourses, archiveExamReservations, deleteEfadaRequest } = require("./Helper/Helper");


const resetAccount = async ({ userId, productId, type }) => {
  return sequelize.transaction(async (t) => {
    await updateStudentAfterReset({ userId, productId, type }, t);
    await createResetPayment({ userId, productId }, t);
    await resetOrCreateStudentCourses({ userId, productId }, t);
    const { cycle, archivedCount } = await archiveExamReservations({ userId }, t);
    await deleteEfadaRequest({ userId }, t);

    return { cycle, archivedCount };
  });
};

module.exports = { resetAccount };