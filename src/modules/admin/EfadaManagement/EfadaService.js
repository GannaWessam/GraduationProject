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
const { efada, Student} = require('../../../models/index');


const efadaService = {
  getAll: async () => {
    const records = await efada.findAll({
      include: [
        {
          model: Student,
          attributes: ['userId', 'fullName', 'nationalId'] 
        }
      ],
      order: [['date', 'DESC']] 
    });
    return records;
  },

  add: async (userId) => {
    const newEfada = await efada.create({
      userId: userId,
      date: new Date(),
    });
    return newEfada;
  }
};

module.exports = efadaService;