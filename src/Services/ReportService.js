const fs = require("fs");
const PdfPrinter = require("pdfmake");

// Convert image to base64
function getImageDataURL(filePath) {
    const base64 = fs.readFileSync(filePath).toString("base64");
    return `data:image/png;base64,${base64}`;
}

function reverseWords(text) {
    if (!text) return "";

    return text
        .toString()
        .trim()
        .split(/\s+/)
        .reverse()
        .join("  ");
}

class ReportService {
    constructor() {
        const fonts = {
            Cairo: {
                normal: "./fonts/Cairo-Regular.ttf",
                bold: "./fonts/Cairo-Regular.ttf",
                italics: "./fonts/Cairo-Regular.ttf",
                bolditalics: "./fonts/Cairo-Regular.ttf",
            },
        };

        this.printer = new PdfPrinter(fonts);
    }

    async generate({
        fileName = "report.pdf",
        title = "تقرير",
        columns = [],
        rows = [],
        logoWidth = 60,   // ← configurable logo size
    } = {}) {

        // Page usable width = A4(595) - left margin(20) - right margin(20) = 555
        const PAGE_USABLE_WIDTH = 555;
        const SPACER_WIDTH = 10;
        const titleWidth = PAGE_USABLE_WIDTH - logoWidth - SPACER_WIDTH;

        const docDefinition = {
            pageSize: "A4",
            pageMargins: [20, 70, 20, 60],

            defaultStyle: {
                font: "Cairo",
                alignment: "right",
                fontSize: 10,
            },

            header: () => ({
                margin: [20, 10, 20, 5],
                stack: [
                    {
                        columns: [
                            {
                                width: "*",
                                stack: [
                                    {
                                        text: reverseWords(title),
                                        alignment: "center",
                                        bold: true,
                                        fontSize: 16,
                                        margin: [0, 5, 0, 3],
                                    },
                                    {
                                        text: reverseWords("جامعة العاصمة - مركز الدراسات والخدمات الأكاديمية"),
                                        alignment: "center",
                                        fontSize: 9,
                                        color: "#666666",
                                    },
                                ],
                            },
                            // Logo column
                            {
                                width: 50,
                                stack: [
                                    {
                                        image: "logo",
                                        fit: [50, 50],
                                        alignment: "right",
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        margin: [0, 8, 0, 0],
                        canvas: [
                            {
                                type: "line",
                                x1: 0,
                                y1: 0,
                                x2: 555,
                                y2: 0,
                                lineWidth: 1,
                                lineColor: "#BDBDBD",
                            },
                        ],
                    },
                ],
            }),
            footer: (currentPage, pageCount) => ({
                margin: [20, 0, 20, 10],
                columns: [
                    {stack:[
                    {
                        text: reverseWords("امضاء رئيس المركز: ..........................."),
                        alignment: "right",
                        width: "auto",
                    },
                    {
                        text: "",
                        width: "*", // pushes the signature to the far right
                    },
                    {
                        text: reverseWords(`صفحة ${currentPage} من ${pageCount}`),
                        alignment: "center",
                        width: "auto",
                        fontSize:5,
                    },
                ]}
                ],
            }),

            images: {
                logo: getImageDataURL("./images/logo.png"),
            },

            content: [
                {
                    margin: [0, 10, 0, 0],

                    table: {
                        headerRows: 1,

                        // Widths from columns config
                        widths: columns.map((col) => col.width || "*"),

                        body: [
                            // Header row
                            columns.map((col) => ({
                                text: col.title,
                                bold: true,
                                alignment: "center",
                            })),

                            // Data rows
                            ...rows.map((row) =>
                                row.map((cell) => ({
                                    text:
                                        cell === null || cell === undefined
                                            ? ""
                                            : String(cell),
                                    alignment: "center",
                                    fontSize: 7,
                                }))
                            ),
                        ],
                    },

                    layout: {
                        hLineWidth: () => 0.5,
                        vLineWidth: () => 0.5,

                        hLineColor: () => "#CCCCCC",
                        vLineColor: () => "#CCCCCC",

                        fillColor: (rowIndex) => {
                            if (rowIndex === 0) return "#D9D9D9";
                            return rowIndex % 2 === 0 ? "#F5F5F5" : "#FFFFFF";
                        },
                    },
                },
            ],
        };

        return new Promise((resolve, reject) => {
            const pdfDoc = this.printer.createPdfKitDocument(docDefinition);
            const stream = fs.createWriteStream(fileName);

            pdfDoc.pipe(stream);
            pdfDoc.end();

            stream.on("finish", () => resolve(fileName));
            stream.on("error", reject);
        });
    }
}

module.exports = ReportService;