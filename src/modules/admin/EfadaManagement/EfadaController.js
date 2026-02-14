// const efadaService = require("../EfadaManagement/EfadaService");

// exports.generateEfada = async (req, res) => {
//   try {
//    // const { name, nationalId } = req.body;
//     const name = "iiiiii";
//     const nationalId = "iiiiii";

//     const pdfBuffer = await efadaService.createEfadaPDF({
//       name ,
//       nationalId,
//       date: new Date().toLocaleDateString("ar-EG")
//     });

//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader(
//       "Content-Disposition",
//       "attachment; filename=efada.pdf"
//     );

//     res.send(pdfBuffer);
//   } catch (error) {
//     res.status(500).json({
//       message: "Failed to generate efada",
//       error: error.message
//     });
//   }
// };
