const {
  registerStudentsFromExcel,
  buildFailedStudentsWorkbook
} = require("./registerStudentsService");

async function registerStudentsToEvent(req, res) {
  const { eventId } = req.params;

  if (!req.file || !req.file.buffer) {
    return res.status(400).json({ error: "Excel file is required (field name: file)" });
  }

  try {
    const summary = await registerStudentsFromExcel(eventId, req.file.buffer);

    const workbook = buildFailedStudentsWorkbook(summary);

    if (!workbook) {
      return res.status(200).json(summary);
    }

    const excelBuffer = await workbook.xlsx.writeBuffer();

    const summaryMessage = {
      en: `Registration completed. Success: ${summary.successCount}, Failed: ${summary.failed.length}, Not Found: ${summary.notFoundIds.length}`,
      ar: `اكتملت عملية التسجيل. تم تسجيل ${summary.successCount} طالب، وفشل ${summary.failed.length} طالب، ولم يتم العثور على ${summary.notFoundIds.length} طالب.`
    };
    
    const encoded = Buffer.from(
      JSON.stringify(summaryMessage),
      "utf8"
    ).toString("base64");

    res.setHeader(
      "Access-Control-Expose-Headers",
      "X-Registration-Summary"
    );
    
    res.setHeader("X-Registration-Summary", encoded);
    
    

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="failed-students-event-${eventId}.xlsx"`
    );
    return res.status(200).send(excelBuffer);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    if (statusCode === 500) console.error(error);
    return res.status(statusCode).json({ error: error.message });
  }
}

module.exports = { registerStudentsToEvent };