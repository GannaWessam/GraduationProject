const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    ImageRun,
    AlignmentType,
    WidthType,
    Table,
    TableRow,
    TableCell,
    BorderStyle,
    VerticalAlign,
  } = require("docx");
  const fs    = require("fs");
  const https = require("https");
const { splitLang } = require("../../../Helpers/langHelper");
const QRCode = require("qrcode");

  const testQr=async(link) => {
    const qr = await QRCode.toDataURL(link);
    return qr
  }
  
  async function createEfadaDOCX({ nationalId, date, picturePath, student, sd }) {
    const url = `${process.env.HOST}/profile?ComesFromEfada=${true}`;
    // ── Read picture + fetch QR in parallel ──────────────────────────────────
    const [pictureBuffer, qrBuffer] = await Promise.all([
      Promise.resolve(fs.readFileSync(picturePath)),
      testQr(url)
    ]);
  
    // ── Shared style helpers ──────────────────────────────────────────────────
    const FONT        = "Arial";
    const SIZE_NORMAL = 28;   // 14pt (docx uses half-points)
    const SIZE_HEADER = 36;   // 18pt
    const SIZE_ADDR   = 30;   // 15pt
    const SIZE_SMALL  = 20;   // 10pt (QR caption)
  
    const run = (text, opts = {}) =>
      new TextRun({ text, font: FONT, size: SIZE_NORMAL, rightToLeft: true, ...opts });
  
    // ── Thin horizontal rule ──────────────────────────────────────────────────
    const hrParagraph = () =>
      new Paragraph({
        bidirectional: true,
        spacing: { before: 40, after: 40 },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 12, color: "000000", space: 1 },
        },
        children: [],
      });
  
    // ── Justified content block ───────────────────────────────────────────────
    const contentBlock = (text) =>
      new Paragraph({
        bidirectional: true,
        alignment: AlignmentType.BOTH,
        spacing: { before: 60, after: 100 },
        indent: { right: 140 },
        children: [run(text)],
      });
  
    // ── College name ──────────────────────────────────────────────────────────
    const collegeName = (() => {
      try {
        return splitLang(student.college).ar || student.college || "";
      } catch {
        return student.college || "";
      }
    })();
  
    // ── Borderless cell helper ────────────────────────────────────────────────
    const noBorder  = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
    const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };
  
    // ── Signature table ───────────────────────────────────────────────────────
    const sigCell = (title, name) =>
      new TableCell({
        borders: noBorders,
        width: { size: 4000, type: WidthType.DXA },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [
          new Paragraph({
            bidirectional: true,
            alignment: AlignmentType.CENTER,
            children: [run(title, { bold: true })],
          }),
          new Paragraph({
            bidirectional: true,
            alignment: AlignmentType.CENTER,
            spacing: { before: 400 },
            children: [run(name)],
          }),
        ],
      });
  
    const spacerCell = new TableCell({
      borders: noBorders,
      width: { size: 1200, type: WidthType.DXA },
      children: [new Paragraph({ children: [] })],
    });
  
    const sigTable = new Table({
      bidiVisual: true,
      width: { size: 9200, type: WidthType.DXA },
      columnWidths: [4000, 1200, 4000],
      rows: [
        new TableRow({
          children: [
            // In RTL: first cell renders on the RIGHT
            sigCell(sd.titlePersonInefada1, sd.nameOfPersonInefada1),
            spacerCell,
            sigCell(sd.titlePersonInefada2, sd.nameOfPersonInefada2),
          ],
        }),
      ],
    });
  
    // ── QR code table (centered below signatures) ─────────────────────────────
    // Single centered cell with QR image + caption
    const qrTable = new Table({
      bidiVisual: true,
      width: { size: 9200, type: WidthType.DXA },
      columnWidths: [9200],
      rows: [
        new TableRow({
          children: [
            new TableCell({
              borders: noBorders,
              width: { size: 9200, type: WidthType.DXA },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [
                // QR image centered
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 70 },
                  children: [
                    new ImageRun({
                      data: qrBuffer,
                      type: "png",
                      transformation: { width: 150, height: 150 },
                    }),
                  ],
                }),
                // Caption line 1
                new Paragraph({
                  bidirectional: true,
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 60 },
                  children: [
                    new TextRun({
                      text: "رمز التحقق من صحة الإفادة",
                      font: FONT,
                      size: SIZE_SMALL,
                      bold: true,
                      rightToLeft: true,
                    }),
                  ],
                }),
                // Caption line 2 (smaller)
                new Paragraph({
                  bidirectional: true,
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: "امسح الرمز للتحقق من صحة هذه الوثيقة",
                      font: FONT,
                      size: 16, // 8pt
                      color: "555555",
                      rightToLeft: true,
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    });
  
    // ── Document ──────────────────────────────────────────────────────────────
    const doc = new Document({
      styles: {
        default: {
          document: { run: { font: FONT, size: SIZE_NORMAL, rightToLeft: true } },
        },
      },
      sections: [
        {
          properties: {
            page: {
              size: { width: 11906, height: 16838 }, // A4 portrait (DXA)
              margin: {
                top:    1247, // 2.2 cm
                right:  1247, // 2.2 cm
                bottom: 1247, // 2.2 cm
                left:   1418, // 2.5 cm
              },
            },
            bidi: true, // forces RTL at page/section level
          },
          children: [
  
            // ── HEADER: title (right) + logo (left) ──────────────────────
            new Table({
              bidiVisual: true,
              width: { size: 9200, type: WidthType.DXA },
              columnWidths: [7600, 1600],
              rows: [
                new TableRow({
                  children: [
                    // Title cell — renders on RIGHT in RTL
                    new TableCell({
                      borders: noBorders,
                      width: { size: 7600, type: WidthType.DXA },
                      verticalAlign: VerticalAlign.CENTER,
                      children: [
                        new Paragraph({
                          bidirectional: true,
                          alignment: AlignmentType.CENTER,
                          children: [
                            run(
                              "مشروع التدريب على تكنولوجيا المعلومات – جامعة العاصمة (حلوان سابقاً)",
                              { bold: true, size: SIZE_HEADER }
                            ),
                          ],
                        }),
                        new Paragraph({
                          bidirectional: true,
                          alignment: AlignmentType.CENTER,
                          children: [
                            run("دورات شهادة أساسيات التحول الرقمي (FDTC)", {
                              bold: true,
                              size: SIZE_HEADER,
                            }),
                          ],
                        }),
                      ],
                    }),
                    // Logo cell — renders on LEFT in RTL
                    new TableCell({
                      borders: noBorders,
                      width: { size: 1600, type: WidthType.DXA },
                      verticalAlign: VerticalAlign.CENTER,
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [
                            new ImageRun({
                              data: pictureBuffer,
                              type: "png",
                              transformation: { width: 85, height: 85 },
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
  
            // ── Separator ────────────────────────────────────────────────
            hrParagraph(),
  
            // ── Addressee line 1 ─────────────────────────────────────────
            new Paragraph({
              bidirectional: true,
              alignment: AlignmentType.LEFT,
              spacing: { before: 60, after: 20 },
              children: [run("السيد الأستاذ الدكتور/", { bold: true, size: SIZE_ADDR })],
            }),
  
            // ── Addressee line 2 ─────────────────────────────────────────
            new Paragraph({
              bidirectional: true,
              alignment: AlignmentType.CENTER,
              spacing: { before: 0, after: 80 },
              children: [
                run(`وكيل كلية ${collegeName} لشئون الدراسات العليا والبحوث`, {
                  bold: true,
                  size: SIZE_ADDR,
                }),
              ],
            }),
  
            // ── Body paragraphs ──────────────────────────────────────────
            contentBlock("تحية طيبة وبعد ،،،"),
            contentBlock("نهدي لسيادتكم وافر التحية والتقدير والاحترام."),
            contentBlock(
              "في إطار العمل على تنفيذ قرارات الجامعة والمجلس الأعلى للجامعات نحو تفعيل دورات شهادة أساسيات التحول الرقمي والتي تعد شرطاً لمنح شهادات الدراسات العليا."
            ),
            contentBlock(
              `نتشرف بأن نفيد سيادتكم علماً بأن / ${student.fullName} رقم قومي/جواز سفر: ${student.nationalId} قد تم الإنتهاء والاجتياز بنجاح لاختبارات دورة شهادة أساسيات التحول الرقمي المطلوبة لمنح شهادات الدراسات العليا.`
            ),
            contentBlock(
              "وقد تم التحقق ومراجعة حالة اجتياز الاختبارات على نظام المجلس الأعلى للجامعات من خلال السيد الدكتور/ مدير مشروع التدريب على تكنولوجيا المعلومات – جامعة العاصمة (حلوان سابقاً)."
            ),
            contentBlock(
              "وهذا للعلم والإحاطة ولحين صدور الشهادة الأصلية من المجلس الأعلى للجامعات ودون أدنى مسئولية على مشروع التدريب على تكنولوجيا المعلومات – جامعة العاصمة (حلوان سابقاً)."
            ),
  
            // ── Closing ──────────────────────────────────────────────────
            new Paragraph({
              bidirectional: true,
              alignment: AlignmentType.LEFT,
              spacing: { before: 80, after: 60 },
              children: [run("وتفضلوا سيادتكم بقبول فائق الإحترام والتقدير،،،", { bold: true })],
            }),
  
            // ── Signatures ───────────────────────────────────────────────
            new Paragraph({ spacing: { before: 200 }, children: [] }),
            sigTable,
  
            // ── QR code (centered, below signatures) ─────────────────────
            qrTable,
  
            // ── Date ─────────────────────────────────────────────────────
            new Paragraph({
              bidirectional: true,
              alignment: AlignmentType.LEFT,
              spacing: { before: 200 },
              children: [run(`تحريراً في: ${date}`)],
            }),
  
          ],
        },
      ],
    });
  
    return await Packer.toBuffer(doc);
  }
  
  module.exports = { createEfadaDOCX };