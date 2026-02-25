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


const efadaService = {
  getAll: async () => {
    const records = await efada.findAll({
      include: [
        {
          model: Student,
          attributes: ['userId', 'fullName', 'nationalId']
        },
        {
          model: Payment,
          attributes: ['paymentId', 'status', 'amount'],
          where: { status: 'PAID' },
          required: true 
        }
      ],
      order: [['date', 'DESC']]
    });
    return records;
  },

  add: async (userId, req) => {

    const t = await sequelize.transaction();
  
    try {
  
      const student = await Student.findByPk(userId, { transaction: t });
      if (!student) {
        throw new Error("Student not found");
      }
  
      const currencyCode =
        student.nationality === "Egypt" || student.nationality === "مصري"
          ? "EGP"
          : "USD";
  
      const Currency = await currency.findOne({
        where: { code: currencyCode },
        transaction: t
      });
  
      if (!Currency) {
        throw new Error("Currency not found");
      }
  
      let serviceName;
  
      if (["1", "2", "3"].includes(student.type)) {
        serviceName = "Statement request | طلب افادة دراسات عليا";
      } else if (student.type === "4") {
        serviceName = "Statement request | طلب افادة اعضاء هيئة تدريس";
      } else {
        throw new Error("Invalid student type");
      }
  
      const service = await Service.findOne({
        where: { name: serviceName },
        transaction: t
      });
  
      if (!service) {
        throw new Error("Service not found");
      }
  
      const amount =
        currencyCode === "EGP"
          ? service.priceEgyptian
          : service.priceOther;
  
      const payment = await Payment.create({
        userId: userId,
        serviceId: service.serviceId,
        receiptId: service.receiptId,
        currencyId: Currency.currencyId,
        amount: amount,
        status: "PENDING",
        productId:null,
      }, { transaction: t });
  

      const newEfada = await efada.create({
        userId: userId,
        paymentId: payment.paymentId,
        date: new Date(),
      }, { transaction: t });
  
      await t.commit();
  
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