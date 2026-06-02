const generateStudentDataExcelService = require('./generateStudentDataExcelService');

/**
 * GET /admin/generateStudentDataExcel/downloadSheet/:eventId.
 */
async function downloadSheet(req, res) {
  const { eventId } = req.params;
  const { workbook, eventName } = await generateStudentDataExcelService.generateStudentDataExcel(eventId,req);

  // const safeName = String(eventName).replace(/[^a-z0-9-_]/gi, '_');
  const safeName = String(eventName);
  const fileName = `${safeName}-Helwan-منح.xlsx`;

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`);
  // attachment → يعني تحميل مش عرض // filename*= → دعم أسماء ملفات Unicode
  // UTF-8'' → الترميز // encodeURIComponent(fileName) → يحوّل العربي والمسافات لشكل آمن

  let buffer;
  try {
    buffer = await workbook.xlsx.writeBuffer();
  } catch (err) {
    throw new Error('excel_generation_failed');
  }
  res.send(buffer); // byb3at elbuffer wel browser byfham mn el header en da excel file w mhtag yt3mlo download
}

module.exports = {
  downloadSheet,
};
