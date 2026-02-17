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
const efadaService = require('./EfadaService');

const efadaController = {
  getAllEfadas: async (req, res) => {
    try {
      const efadas = await efadaService.getAll();
      res.status(200).json({
        success: true,
        data: efadas
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: 'Error fetching efada records'
      });
    }
  },

  addEfada: async (req, res) => {
    try {
    const userId = req.userData.id;
      if (!userId) {
        return res.status(400).json({ success: false, message: 'Date is required' });
      }

      const newEfada = await efadaService.add(userId, req);

      res.status(201).json({
        success: true,
        data: newEfada
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: 'Error creating efada record'
      });
    }
  }
};

module.exports = efadaController;