const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");
const {
  efada,
  Student,
  Service,
  Payment,
  currency,
  sequelize,
  systemdata,
} = require("../../../models/index");
const PaginatedResponse = require("../../../Util/PaginatedResponse");
const { splitLang } = require("../../../Helpers/langHelper");
const { createEfadaDOCX } = require("./createEfadaDOCX");




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
      "Efadas fetched successfully",
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
      let serviceID;

      if (["1", "2", "3"].includes(student.type)) {
        serviceID = process.env.STATMENT_REQUEST_POST_GRAD_ID
      } else if (student.type === "4") {
        serviceID =process.env.STATMENT_REQUEST_STUFF_ID 
      } else {
        throw new Error("Invalid student type");
      }

      // 3️⃣ Get service
      const service = await Service.findOne({
        where: { serviceId: serviceID },
        transaction: t,
      });

      if (!service) {
        throw new Error("Service not found");
      }

      // 4️⃣ Determine nationality (نفس Reexam)
      
      const isEgyptian =
        splitLang(student.nationality).en=== "Egyptian" || splitLang(student.nationality).ar === "مصري";

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
        { transaction: t },
      );

      // 6️⃣ Create Efada
      const newEfada = await efada.create(
        {
          userId: userId,
          paymentId: payment.paymentId,
          date: new Date(),
        },
        { transaction: t },
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
  },
  createEfadaPDF: async ({ nationalId, date, picturePath }) => {
    // Get student by nationalId
    const student = await Student.findOne({ where: { nationalId } });
    if (!student) throw new Error("student_not_found");

    // Get system data (signatures)
    const sd = await systemdata.findOne();

    // Choose HTML template based on type
    let templateFile = "index.html"; // default
    if (["4", "2", "3"].includes(student.type)) {
      templateFile = "efada2.html";
    }

    const htmlPath = path.join(__dirname, templateFile);
    let html = fs.readFileSync(htmlPath, "utf8");

    // Read image as Base64
    const pictureBuffer = fs.readFileSync(picturePath);
    const pictureBase64 = `data:image/png;base64,${pictureBuffer.toString("base64")}`;
    const url = `${process.env.HOST}/profile?ComesFromEfada=${true}`;
    const qr = await QRCode.toDataURL(url);

    // Replace placeholders dynamically
    html = html
      .replace(/{{name}}/g, student.fullName)
      .replace(/{{nationalId}}/g, student.nationalId)
      .replace(/{{date}}/g, date)
      .replace(/{{Picture1\.png}}/g, pictureBase64)
      .replace(/{{collegename}}/g,  splitLang(student.college).ar?? student.college ?? "")
      .replace(/{{titlePersonInefada1}}/g, sd.titlePersonInefada1)
      .replace(/{{nameOfPersonInefada1}}/g, sd.nameOfPersonInefada1)
      .replace(/{{titlePersonInefada2}}/g, sd.titlePersonInefada2)
      .replace(/{{nameOfPersonInefada2}}/g, sd.nameOfPersonInefada2)
      .replace(/{{Picture2\.png}}/g, qr);

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "2.2cm", right: "2.2cm", bottom: "2.2cm", left: "2.5cm" },
    });

    await browser.close();
    return pdf;
  },
  createEfadaDOCX: async ({ nationalId, date, picturePath }) => {
    const student = await Student.findOne({ where: { nationalId } });
    if (!student) throw new Error("student_not_found");
  
    const sd = await systemdata.findOne();
  
    const buffer = await createEfadaDOCX({ nationalId, date, picturePath, student, sd });
    return buffer;
  },

  
};

module.exports = efadaService;
