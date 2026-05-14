// generateQRs.js

const QRCode = require("qrcode");
const { Student } = require("../src/models"); 
const { generateQr } = require("../src/modules/Auth/helpers/userHelper");

async function generateMissingQRs() {
  try {

    console.log("Starting QR generation...");

    // get students with null qr
    const students = await Student.findAll({
      where: {
        profilePhoto: null,
      },
    });

    console.log(`Found ${students.length} students`);

    for (const student of students) {

      const qrImage =await generateQr(student.fullName, student.nationalId);

      // update database
      await student.update({
        profilePhoto: qrImage,
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