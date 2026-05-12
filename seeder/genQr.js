// generateQRs.js

const QRCode = require("qrcode");
const { Student } = require("../src/models"); 

async function generateMissingQRs() {
  try {

    console.log("Starting QR generation...");

    // get students with null qr
    const students = await Student.findAll({
      where: {
        QRdata: null,
      },
    });

    console.log(`Found ${students.length} students`);

    for (const student of students) {

      const qrData = JSON.stringify({
        name: student.fullName,
        nationalId: student.nationalId,
      });

      // generate qr base64
      const qrBase64 = await QRCode.toDataURL(qrData);

      // update database
      await student.update({
        QRdata: qrBase64,
      });

      console.log(`Generated QR for: ${student.fullName}`);
    }

    console.log("Done Successfully");

    process.exit(0);

  } catch (error) {

    console.error("Error:", error);

    process.exit(1);
  }
}

generateMissingQRs();