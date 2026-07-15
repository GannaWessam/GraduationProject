const { Student, User, Product, currency, Payment, studentCourse, productCourse, efada, examReservationArchive, examReservation } = require("../../../../models");

const updateStudentAfterReset = async ({ userId, productId, type }, transaction) => {
  const [affectedCount] = await Student.update(
    {
      status: "approved",
      type,
      productId,
    },
    {
      where: { userId },
      transaction,
    }
  );

  if (affectedCount === 0) {
    const error = new Error("Student not found for reset");
    error.statusCode = 404;
    throw error;
  }

  await User.increment("tokenVersion", { where: { userId: userId } });

  return affectedCount;
};

const createResetPayment = async ({ userId, productId }, transaction) => {
  const student = await Student.findOne({
    where: { userId },
    transaction,
  });

  if (!student) {
    const error = new Error("Student not found for payment creation");
    error.statusCode = 404;
    throw error;
  }

  const product = await Product.findByPk(productId, { transaction });

  if (!product) {
    const error = new Error("Product not found for payment creation");
    error.statusCode = 404;
    throw error;
  }


  await Payment.destroy({
    where: {
      userId,
      status: "PENDING",
    },
    transaction,
  });

  const isEgyptian =
    student.nationality === "Egyptian | مصري" || student.nationality === "مصري";

  let receiptId;
  let currencyId;
  let amount;

  if (isEgyptian) {
    receiptId = product.receiptId;
    amount = product.priceEgyptian;

    const egpCurrency = await currency.findOne({
      where: { code: "EGP" },
      transaction,
    });

    if (!egpCurrency) throw new Error("EGP currency not found");

    currencyId = egpCurrency.currencyId;
  } else {
    receiptId = product.receiptIdOthers;
    amount = product.priceOther;

    if (!product.currencyId)
      throw new Error("Product currency not defined for foreign students");

    currencyId = product.currencyId;
  }

  const payment = await Payment.create(
    {
      userId,
      productId: product.productId,
      receiptId,
      currencyId,
      amount,
      status: "PENDING",
    },
    { transaction }
  );

  return payment;
};

const resetOrCreateStudentCourses = async ({ userId, productId }, transaction) => {
    const existingCourses = await studentCourse.findAll({
      where: { userId },
      transaction,
    });
  
    if (existingCourses.length > 0) {
      await studentCourse.update(
        {
          trainingStatus: "registing",
          examStatus: "registing",
          attempts: 0,
        },
        {
          where: { userId },
          transaction,
        }
      );
  
      return existingCourses.map((c) => c.courseId);
    }
  
    const productCourses = await productCourse.findAll({
      where: { productId },
      transaction,
    });
  
    let assignedCourses = [];
  
    if (productCourses.length > 0) {
      const newStudentCourses = productCourses.map((pc) => ({
        userId,
        courseId: pc.courseId,
        examStatus: "registing",
        trainingStatus: "registing",
      }));
  
      const createdCourses = await studentCourse.bulkCreate(newStudentCourses, {
        transaction,
      });
  
      assignedCourses = createdCourses.map((c) => c.courseId);
    }
  
    return assignedCourses;
  };

  const archiveExamReservations = async ({ userId }, transaction) => {
    const reservations = await examReservation.findAll({
      where: { userId },
      transaction,
    });
  
    if (reservations.length === 0) {
      return { cycle: null, archivedCount: 0 };
    }
  
    const lastCycle = await examReservationArchive.max("cycle", {
      where: { userId },
      transaction,
    });
  
    const nextCycle = (lastCycle || 0) + 1;
  
    const archiveRows = reservations.map((r) => ({
      originalExamReservationId: r.examReservationId,
      reservationId: r.reservationId,
      userId: r.userId,
      examId: r.examId,
      type: r.type,
      attempts: r.attempts,
      result: r.result,
      reservationStatus: r.reservationStatus,
      cycle: nextCycle,
    }));
  
    await examReservationArchive.bulkCreate(archiveRows, { transaction });
  
    await examReservation.destroy({
      where: { userId },
      transaction,
    });
  
    return { cycle: nextCycle, archivedCount: reservations.length };
  };
  
  const deleteEfadaRequest = async ({ userId }, transaction) => {
    const deletedCount = await efada.destroy({
      where: { userId },
      transaction,
    });
  
    return deletedCount;
  };

module.exports = {
    updateStudentAfterReset,
    createResetPayment,
    resetOrCreateStudentCourses,
    archiveExamReservations,
    deleteEfadaRequest,
};