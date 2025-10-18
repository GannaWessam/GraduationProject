const PDFDocument = require("pdfkit");

class PDFDocumentWithTables extends PDFDocument {
  constructor(options) {
    super(options);
  }

  table(table, options = {}) {
    let startX = options.x || this.page.margins.left;
    let startY = options.y || this.y;
    const columnCount = table.headers.length;
    const columnSpacing = options.columnSpacing || 10;
    const rowSpacing = options.rowSpacing || 5;
    const usableWidth =
      options.width ||
      this.page.width - this.page.margins.left - this.page.margins.right;
    const columnWidth = usableWidth / columnCount - columnSpacing;

    const footerHeight = options.footerHeight || 120;
    const maxY = this.page.height - this.page.margins.bottom - footerHeight;

    const prepareHeader = options.prepareHeader || (() => {});
    const prepareRow = options.prepareRow || (() => {});
    const computeRowHeight = (row) => {
      let result = 0;
      row.forEach((cell) => {
        const text = typeof cell === "object" ? cell.text : cell;
        const cellHeight = this.heightOfString(text || "", {
          width: columnWidth,
          align: "right",
        });
        result = Math.max(result, cellHeight);
      });
      return result + rowSpacing;
    };

    let rowBottomY = startY;

    // ✅ Helper to draw styled header (used for first + repeated headers)
    const drawHeader = () => {
      prepareHeader();
      const headerHeight = computeRowHeight(table.headers);

      this.rect(startX, rowBottomY - 4, usableWidth, headerHeight)
        .fill("#f0f0f0")
        .fillColor("#000");

      table.headers.forEach((header, i) => {
        this.font("ArabicFont")
          .fontSize(13)
          .fillColor("#000")
          .text(
            header,
            startX + i * (columnWidth + columnSpacing),
            rowBottomY,
            {
              width: columnWidth,
              align: "center",
            }
          );
      });

      rowBottomY += headerHeight;

      this.moveTo(startX, rowBottomY - rowSpacing * 0.5)
        .lineTo(startX + usableWidth, rowBottomY - rowSpacing * 0.5)
        .lineWidth(1.2)
        .strokeColor("#555")
        .stroke();
    };

    //  Draw header for first page
    if (!options.skipHeader) {
      drawHeader();
    }

    if (options.drawFooter) options.drawFooter(this);

    // Draw table rows
    table.rows.forEach((row, i) => {
      const rowHeight = computeRowHeight(row);

      if (rowBottomY + rowHeight >= maxY) {
        this.addPage();
        rowBottomY = this.page.margins.top;

        // Redraw styled header for subsequent pages
        if (options.repeatHeader) {
          drawHeader();
        }

        if (options.drawFooter) options.drawFooter(this);
      }

      prepareRow(row, i);

      const bgColor = i % 2 === 0 ? "#ffffff" : "#f7f7f7";
      this.rect(startX, rowBottomY - 2, usableWidth, rowHeight + 1)
        .fill(bgColor)
        .fillColor("#000");

      row.forEach((cell, colIndex) => {
        const text = typeof cell === "object" ? cell.text : cell;
        const align = cell?.align || "center";
        this.font("ArabicFont")
          .fontSize(12)
          .fillColor("#000")
          .text(
            text || "",
            startX + colIndex * (columnWidth + columnSpacing),
            rowBottomY,
            {
              width: columnWidth,
              align,
            }
          );
      });

      rowBottomY += rowHeight;

      this.moveTo(startX, rowBottomY - rowSpacing * 0.3)
        .lineTo(startX + usableWidth, rowBottomY - rowSpacing * 0.3)
        .lineWidth(0.5)
        .strokeColor("#cccccc")
        .stroke();
    });

    this.x = startX;
    this.moveDown();
    return this;
  }
}

module.exports = PDFDocumentWithTables;
