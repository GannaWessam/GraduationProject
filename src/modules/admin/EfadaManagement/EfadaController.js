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
const ApiFeature = require("../../../Util/ApiFeatures");
const ApiResponse = require("../../../Util/ApiResponse");

const efadaController = {
  getAllEfadas: async (req, res) => {
    const features = new ApiFeature(req.query)
      .filter()
      .search()
      .sort()
      .pagination()
      .selectedFields();
  
    const result = await efadaService.getAll(features);
  
    res.status(200).json(ApiResponse.success(result));
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