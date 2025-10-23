const path = require("path");
const fs = require("fs");
const PDFDocument = require("../../Util/pdfkit-tables");
const fixArabic = require("../../Util/fixArabic");
const ApiFeature = require("../../Util/ApiFeatures");
const { Student,Payment,Product,User } = require("../../models/index.js");
async function generateArabicReport(reqQuery) {
  
  const apiFeature = new ApiFeature(reqQuery).filter().search().sort();
  apiFeature.options.include = [
    {
      model: User,
      include: [{ model: Student }],
    },
    {
      model: Product,
      attributes: ["courseName"],
    },
  ];
  if (!apiFeature.options.order) {
    apiFeature.options.order = [["timestamp", "ASC"]];
  }

  const records = await Payment.findAll(apiFeature.options);
  if (!records.length) throw new Error("no_records");


  const table = {
    headers: [
      fixArabic("تاريخ الحجز"),
      fixArabic("الاسم"),
      fixArabic("الرقم القومي"),
      fixArabic("الهاتف"),
      fixArabic("اسم الكورس"),
    ],
    rows: records.map((r) => {
      const bookingDate = r.timestamp ? r.timestamp.toISOString().split("T")[0] : "";
      const studentName = fixArabic(r.User?.Student?.fullName || "");
      const nationalId = r.User?.Student?.nationalId || "";
      const mobile = r.User?.Student?.Mobile || "";

      let arabicCourse = "";
      if (r.Product?.courseName) {
        const parts = r.Product.courseName.split("|");
        if (parts.length > 1) arabicCourse = fixArabic(parts[1].trim());
      }

      return [bookingDate, studentName, nationalId, mobile, arabicCourse];
    }),
  };

  const reportsDir = path.join(__dirname, "../../../reports");
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
  const pdfPath = path.join(reportsDir, "arabic_report.pdf");

  const doc = new PDFDocument({ size: "A4", margin: 15, layout: "portrait" });
  const writeStream = fs.createWriteStream(pdfPath);
  doc.pipe(writeStream);


  const fontPath = path.join(__dirname, "../../../fonts", "Amiri-Regular.ttf");
  doc.registerFont("ArabicFont", fontPath).font("ArabicFont");

  const logoPath = path.join(__dirname, "../../../images", "helwan-logo.png");
  if (fs.existsSync(logoPath)) doc.image(logoPath, 50, 10, { width: 55 });

  doc.fontSize(18).text(fixArabic("تقرير  بيانات الطلاب والكورسات"), { align: "center" }).moveDown(1);


  const drawFooter = (doc, top) => {
    const date = new Date();
    const fullDate = `${date.toLocaleDateString("en-GB")} - ${date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })}`;
    doc.font("ArabicFont").fontSize(12).fillColor("#000");
    doc.text(fixArabic("توقيع المدير"), doc.page.height - 350, top, { align: "left" });
    doc.text(`${fullDate} ${fixArabic("تاريخ الاستخراج")}`, 70, top, { align: "left" });
    doc.text(fixArabic("المستخرج: Ghoniem"), doc.page.height - 392, top + 25, { align: "left" });
    doc.text(fixArabic("شؤون العاملين"), 70, top + 25, { align: "left" });
    doc.moveTo(50, top + 60)
      .lineTo(doc.page.width - 50, top + 60)
      .lineWidth(1)
      .strokeColor("#999")
      .stroke();
    doc.fontSize(10)
      .fillColor("#444")
      .text(
        fixArabic("© 2025 جامعة حلوان - مركز تكنولوجيا المعلومات - جميع الحقوق محفوظة"),
        0,
        top + 70,
        { align: "center" }
      );
  };

  const footerHeight = 120;
  doc.table(table, {
    columnSpacing: 8,
    padding: 2,
    width: doc.page.width - 30,
    x: 15,
    y: 90,
    repeatHeader: true,
    drawFooter: (docInstance) => drawFooter(docInstance, docInstance.page.height - footerHeight),
    footerHeight: footerHeight,
  });

  doc.end();

  return new Promise((resolve, reject) => {
    writeStream.on("finish", () => resolve(pdfPath));
    writeStream.on("error", reject);
  });
}

module.exports = { generateArabicReport };
