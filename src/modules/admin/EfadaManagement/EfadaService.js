// const puppeteer = require("puppeteer");
// const fs = require("fs");
// const path = require("path");

// exports.createEfadaPDF = async ({ name, nationalId, date }) => {
//   const browser = await puppeteer.launch({
//     headless: true,
//     args: ["--no-sandbox", "--disable-setuid-sandbox"]
//   });

//   const page = await browser.newPage();

//   // اقرأ الصورة Buffer (من غير utf8)
//   const logoBuffer = fs.readFileSync(
//     path.join(__dirname, "..", "..", "..", "..","images", "helwan-logo.png")
//   );

//   const logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;

//   let html = fs.readFileSync(
//     path.join(__dirname, "efada.html"),
//     "utf8"
//   );

//   html = html
//     .replace("{{logo}}", logoBase64)
//     .replace("{{name}}", name)
//     .replace("{{nationalId}}", nationalId)
//     .replace("{{date}}", date);

//   await page.setContent(html, {
//     waitUntil: "networkidle0"
//   });

//   const pdf = await page.pdf({
//     format: "A4",
//     printBackground: true
//   });

//   await browser.close();
//   return pdf;
// };
const { efada, Student ,Service ,Payment ,currency ,sequelize} = require('../../../models/index');
const PaginatedResponse = require("../../../Util/PaginatedResponse");


const efadaService = {
  getAll: async (features) => {
    const { count, rows } = await efada.findAndCountAll({
      ...features.options,
      include: [
        {
          model: Student,
          attributes: ["userId", "fullName", "nationalId","NameEn","type"],
        },
        {
          model: Payment,
          attributes: ["paymentId", "status", "amount"],
          where: { status: "PAID" }, 
          required: true,
        },
      ],
      order: [["date", "DESC"]],
    });
  
    return PaginatedResponse.fromApiFeature(
      features,
      count,
      rows,
      "Efadas fetched successfully"
    );
  },

  add: async (userId, req) => {

    const t = await sequelize.transaction();

  try {
    // 1️⃣ Get student
    const student = await Student.findByPk(userId, { transaction: t });
    if (!student) {
      throw new Error("Student not found");
    }

    // 2️⃣ Determine service name based on student type
    let serviceName;

    if (["1", "2", "3"].includes(student.type)) {
      serviceName = "Statement request | طلب افادة دراسات عليا";
    } else if (student.type === "4") {
      serviceName = "Statement request | طلب افادة اعضاء هيئة تدريس";
    } else {
      throw new Error("Invalid student type");
    }

    // 3️⃣ Get service
    const service = await Service.findOne({
      where: { name: serviceName },
      transaction: t,
    });

    if (!service) {
      throw new Error("Service not found");
    }

    // 4️⃣ Determine nationality (نفس Reexam)
    const isEgyptian =
      student.nationality === "Egyptian" ||
      student.nationality === "مصري";

    let receiptId;
    let currencyId;
    let amount;

    if (isEgyptian) {
      // ✅ مصري
      receiptId = service.receiptId;
      amount = service.priceEgyptian;

      const egpCurrency = await currency.findOne({
        where: { code: "EGP" },
        transaction: t,
      });

      if (!egpCurrency) {
        throw new Error("EGP currency not found");
      }

      currencyId = egpCurrency.currencyId;

    } else {
      // ✅ غير مصري
      receiptId = service.receiptIdOthers;
      amount = service.priceOther;

      if (!service.currencyId) {
        throw new Error("Service currencyId not defined for others");
      }

      currencyId = service.currencyId;
    }

    // 5️⃣ Create payment
    const payment = await Payment.create(
      {
        userId: userId,
        serviceId: service.serviceId,
        receiptId: receiptId,
        currencyId: currencyId,
        amount: amount,
        status: "PENDING",
        productId: null,
      },
      { transaction: t }
    );

    // 6️⃣ Create Efada
    const newEfada = await efada.create(
      {
        userId: userId,
        paymentId: payment.paymentId,
        date: new Date(),
      },
      { transaction: t }
    );

    await t.commit();

    // 7️⃣ Audit
    if (req && req.audit) {
      req.audit.affectedUser = { _id: userId };
      req.audit.message =
        "Efada created with payment & currency successfully | تم إنشاء إفادة وربطها بعملية دفع وعملة بنجاح";
    }

    return newEfada;

  } catch (error) {
    await t.rollback();
    throw error;
  }
  }
};

module.exports = efadaService;