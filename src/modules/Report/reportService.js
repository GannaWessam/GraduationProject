const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

class ReportService {
  static async generateReport({ model, fields, filters = {}, format, filename }) {
    const records = await model.findAll({
      where: filters,
      attributes: fields,
      raw: true,
    });

    if (!records.length) throw new Error("No data found for report");

    const reportsDir = path.join(__dirname, "../../../reports");
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir);

    if (format === "excel") {
      return this.generateExcel(records, fields, path.join(reportsDir, `${filename}.xlsx`));
    } else if (format === "pdf") {
      return this.generatePDF(records, fields, path.join(reportsDir, `${filename}.pdf`));
    } else {
      throw new Error("Invalid format (must be excel or pdf)");
    }
  }

  static async generateExcel(records, fields, filePath) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Report");

    // header
    sheet.addRow(fields);

    // rows
    records.forEach((r) => sheet.addRow(fields.map((f) => r[f] || "")));

    await workbook.xlsx.writeFile(filePath);
    return filePath;
  }
  static generatePDF(records, fields, filePath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);

    stream.on("finish", () => resolve(filePath));
    stream.on("error", reject);

    doc.pipe(stream);

    doc.fontSize(18).text("System Report", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(fields.join(" | "), { underline: true });
    doc.moveDown();

    records.forEach((r) => {
      doc.text(fields.map((f) => r[f] || "").join(" | "));
    });

    doc.end();
  });
}

}

module.exports = ReportService;
