// const efadaService = require("../EfadaManagement/EfadaService");
const efadaService = require("./EfadaService");
const ApiFeature = require("../../../Util/ApiFeatures");
const ApiResponse = require("../../../Util/ApiResponse");
const path = require("path"); // ✅ أضف هذا السطر

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
        return res
          .status(400)
          .json({ success: false, message: "User Id is required" });
      }

      const newEfada = await efadaService.add(userId, req);

      res.status(201).json({
        success: true,
        data: newEfada,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Error creating efada record",
      });
    }
  },
  generateEfada: async (req, res) => {
    try {
      const { name, nationalId } = req.body;

      const date = new Date().toLocaleDateString("ar-EG");

      // مسار الصورة (مثلاً موجودة في مجلد images)
      const picturePath = path.join(
        __dirname,
        "Picture1.png",
      );

      const pdfBuffer = await efadaService.createEfadaPDF({
        nationalId,
        date,
        picturePath,
        req
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=efada.pdf`,
      );
      res.send(pdfBuffer);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "فشل في توليد خطاب الإفادة",
        error: error.message,
      });
    }
  },
  generateEfadaDOCX: async (req, res) => {
    try {
      const { name, nationalId } = req.body;

      const date = new Date().toLocaleDateString("ar-EG");

      const picturePath = path.join(
        __dirname,
        "Picture1.png",
      );

      const docxBuffer = await efadaService.createEfadaDOCX({
        nationalId,
        date,
        picturePath,
        req
      });

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=efada.docx`,
      );
      res.send(docxBuffer);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "فشل في توليد خطاب الإفادة",
        error: error.message,
      });
    }
  },
};

module.exports = efadaController;
