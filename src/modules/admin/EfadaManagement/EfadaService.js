const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const HTMLtoDOCX = require("html-to-docx");
const QRCode = require("qrcode");
const htmlDocx = require("html-docx-js");
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

/**
 * Find the index right after the matching </div> for a <div ...> that starts at openIdx.
 * Returns -1 if no match.
 */
function imageToBase64(imagePath) {

  const image = fs.readFileSync(imagePath);

  const ext = path.extname(imagePath)
    .replace(".", "");

  return `data:image/${ext};base64,${image.toString("base64")}`;
}
function findMatchingDivClose(html, openIdx) {
  let i = openIdx + 4; // skip past "<div"
  let depth = 1;
  while (i < html.length && depth > 0) {
    const nextOpen = html.indexOf("<div", i);
    const nextClose = html.indexOf("</div>", i);
    if (nextClose === -1) return -1;
    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth++;
      i = nextOpen + 4;
    } else {
      depth--;
      if (depth === 0) return nextClose + 6;
      i = nextClose + 6;
    }
  }
  return -1;
}

/**
 * Convert layout primitives that DOCX cannot render (flexbox / absolute positioning)
 * into table-based equivalents while keeping the same visual look.
 *  - .header (logo + project info) -> 3-col table
 *  - .signatures (sig | qr | sig)  -> 2- or 3-col table
 */
function adaptHtmlForDocx(html) {
  // ---------- 1) header ----------
  const headerOpenIdx = html.indexOf('<div class="header">');
  const headerHrIdx = html.indexOf('<hr class="separator"', headerOpenIdx);
  if (headerOpenIdx !== -1 && headerHrIdx !== -1 && headerHrIdx > headerOpenIdx) {
    const headerBlock = html.substring(headerOpenIdx, headerHrIdx);

    const imgSrcMatch = headerBlock.match(/<img[^>]*src="([^"]+)"/);
    const projMatch = headerBlock.match(
      /<div class="project-info">([\s\S]*?)<\/div>/,
    );

    const imgSrc = imgSrcMatch ? imgSrcMatch[1] : "";
    const projText = projMatch ? projMatch[1].trim() : "";

    const newHeader =
      '<table style="width:100%; border-collapse:collapse; margin-bottom:0.3cm;" cellspacing="0" cellpadding="0">' +
      "<tr>" +
      '<td style="width:120px; vertical-align:middle; text-align:center;" width="120">' +
      `<img src="${imgSrc}" alt="" style="width:100px; height:auto;" />` +
      "</td>" +
      '<td style="text-align:center; vertical-align:middle; font-size:18pt; font-weight:bold; line-height:1.3;">' +
      projText +
      "</td>" +
      '<td style="width:40px;" width="40"></td>' +
      "</tr>" +
      "</table>";

    html =
      html.substring(0, headerOpenIdx) + newHeader + html.substring(headerHrIdx);
  }

  // ---------- 2) signatures ----------
  const sigOpenIdx = html.indexOf('<div class="signatures">');
  if (sigOpenIdx !== -1) {
    const sigEndIdx = findMatchingDivClose(html, sigOpenIdx);
    if (sigEndIdx !== -1) {
      const sigBlock = html.substring(sigOpenIdx, sigEndIdx);

      const sigPartRegex =
        /<div class="sig-block">\s*<div class="sig-title">([\s\S]*?)<\/div>\s*([\s\S]*?)\s*<\/div>/g;
      const sigParts = [];
      let m;
      while ((m = sigPartRegex.exec(sigBlock)) !== null) {
        sigParts.push({ title: m[1].trim(), name: m[2].trim() });
      }

      const qrMatch = sigBlock.match(/<img[^>]*class="qr-image"[^>]*\/?>/);
      const qrImgTag = qrMatch ? qrMatch[0] : null;

      let newSig = sigBlock;
      if (qrImgTag && sigParts.length === 2) {
        newSig =
          '<table style="width:100%; border-collapse:collapse; margin-top:1cm;" cellspacing="0" cellpadding="0">' +
          "<tr>" +
          '<td style="width:32%; text-align:center; vertical-align:bottom; font-size:14pt;">' +
          `<div style="font-weight:bold; margin-bottom:0.6cm;">${sigParts[0].title}</div>` +
          sigParts[0].name +
          "</td>" +
          '<td style="width:36%; text-align:center; vertical-align:bottom;">' +
          '<div style="display:inline-block; padding:4px; border:1px solid #000;">' +
          qrImgTag +
          "</div>" +
          "</td>" +
          '<td style="width:32%; text-align:center; vertical-align:bottom; font-size:14pt;">' +
          `<div style="font-weight:bold; margin-bottom:0.6cm;">${sigParts[1].title}</div>` +
          sigParts[1].name +
          "</td>" +
          "</tr>" +
          "</table>";
      } else if (sigParts.length === 2) {
        newSig =
          '<table style="width:100%; border-collapse:collapse; margin-top:1cm;" cellspacing="0" cellpadding="0">' +
          "<tr>" +
          '<td style="width:50%; text-align:center; vertical-align:bottom; font-size:14pt;">' +
          `<div style="font-weight:bold; margin-bottom:0.6cm;">${sigParts[0].title}</div>` +
          sigParts[0].name +
          "</td>" +
          '<td style="width:50%; text-align:center; vertical-align:bottom; font-size:14pt;">' +
          `<div style="font-weight:bold; margin-bottom:0.6cm;">${sigParts[1].title}</div>` +
          sigParts[1].name +
          "</td>" +
          "</tr>" +
          "</table>";
      }

      html = html.substring(0, sigOpenIdx) + newSig + html.substring(sigEndIdx);
    }
  }

  return html;
}

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
        student.nationality === "Egyptian" || student.nationality === "مصري";

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
      .replace(/{{nameOfPersonInefada2}}/g, sd.nameOfPersonInefada2);

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

  /**
   * Generate the Efada letter as a Word (.docx) file.
   * Reuses the same HTML templates (efada2.html / index.html) and the same
   * placeholder replacements as the PDF flow, then adapts the layout for DOCX
   * (flex/absolute -> tables) and renders via html-to-docx.
   */
  createEfadaWord: async ({ nationalId, date, picturePath }) => {
    const student = await Student.findOne({ where: { nationalId } });
    if (!student) throw new Error("student_not_found");

    const sd = await systemdata.findOne();

    let templateFile = "index.html";
    if (["4", "2", "3"].includes(student.type)) {
      templateFile = "efada2.html";
    }

    const htmlPath = path.join(__dirname, templateFile);
    let html = fs.readFileSync(htmlPath, "utf8");

    const pictureBuffer = fs.readFileSync(picturePath);
    const pictureBase64 = `data:image/png;base64,${pictureBuffer.toString("base64")}`;

    // Generate a local base64 QR (placeholder until real backend QR is wired in).
    // Using the qrcode lib avoids any external HTTP fetch during DOCX build.
    const qrPayloadUrl = `https://verify.example.com/efada/PLACEHOLDER-${student.nationalId}`;
    let qrBase64 = "";
    try {
      qrBase64 = await QRCode.toDataURL(qrPayloadUrl, {
        margin: 0,
        width: 240,
        errorCorrectionLevel: "M",
      });
    } catch (e) {
      qrBase64 = "";
    }

    // Same replacements as the PDF flow
    html = html
      .replace(/{{name}}/g, student.fullName)
      .replace(/{{nationalId}}/g, student.nationalId)
      .replace(/{{date}}/g, date)
      .replace(/{{Picture1\.png}}/g, pictureBase64)
      .replace(
        /{{collegename}}/g,
        splitLang(student.college).ar ?? student.college ?? "",
      )
      .replace(/{{titlePersonInefada1}}/g, sd?.titlePersonInefada1 ?? "")
      .replace(/{{nameOfPersonInefada1}}/g, sd?.nameOfPersonInefada1 ?? "")
      .replace(/{{titlePersonInefada2}}/g, sd?.titlePersonInefada2 ?? "")
      .replace(/{{nameOfPersonInefada2}}/g, sd?.nameOfPersonInefada2 ?? "");

    // Swap the (now-real) external QR <img> for an embedded base64 QR so
    // Word doesn't need to hit the network. Same visual look, ~105px box.
    if (qrBase64) {
      html = html.replace(
        /<img[^>]*class="qr-image"[^>]*\/?>(?:\s*<\/img>)?/g,
        `<img class="qr-image" src="${qrBase64}" alt="رمز التحقق من صحة الإفادة" width="105" height="105" style="width:105px; height:105px;" />`,
      );
    }

    // Convert flex/absolute layout primitives into tables for Word.
    html = adaptHtmlForDocx(html);

    const docxBuffer = await HTMLtoDOCX(html, null, {
      orientation: "portrait",
      pageSize: { width: 11906, height: 16838 }, // A4 in TWIPs
      margins: {
        top: 1247, // 2.2cm
        right: 1247, // 2.2cm
        bottom: 1247, // 2.2cm
        left: 1417, // 2.5cm
      },
      font: "Arial",
      fontSize: 28, // 14pt (half-points)
      complexScriptFontFamily: "Arial",
      table: { row: { cantSplit: true } },
    });

    return docxBuffer;
  },

  generateWordFile: async (data) => {

    try {

      const htmlPath = path.join(
        __dirname,
        "efada3.html"
      );
    
      // read html template
      let html = fs.readFileSync(
        htmlPath,
        "utf8"
      );
    
      // convert logo image to base64
      const logoBase64 = imageToBase64(
        path.join(
          __dirname,
          "Picture1.png"
        )
      );
    
      // add image inside html
      html = html.replace(
        /{{logo}}/g,
        logoBase64
      );
    
      // replace placeholders
      Object.keys(data).forEach((key) => {
    
        const regex = new RegExp(
          `{{${key}}}`,
          "g"
        );
    
        html = html.replace(
          regex,
          data[key] || ""
        );
      });
    
      // convert html to blob
      const blob = htmlDocx.asBlob(html);
    
      // blob -> arrayBuffer
      const arrayBuffer =
        await blob.arrayBuffer();
    
      // arrayBuffer -> buffer
      const buffer =
        Buffer.from(arrayBuffer);
    
      return buffer;
  
    } catch (error) {
  
      console.error(error);
  
      throw error;
    }
  },
  
};

module.exports = efadaService;
