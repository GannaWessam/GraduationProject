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
          .json({ success: false, message: "Date is required" });
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
        name,
        nationalId,
        date,
        picturePath,
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
        name,
        nationalId,
        date,
        picturePath,
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

  generateEfadaWord: async (req, res) => {
    try {
      const { name, nationalId } = req.body;

      const date = new Date().toLocaleDateString("ar-EG");

      const picturePath = path.join(__dirname, "Picture1.png");

      const docxBuffer = await efadaService.createEfadaWord({
        name,
        nationalId,
        date,
        picturePath,
      });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=efada.docx`,
      );
      res.send(docxBuffer);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "فشل في توليد خطاب الإفادة بصيغة Word",
        error: error.message,
      });
    }
  },
  generateWord : async (req, res) => {

    try {
  
      const buffer = await efadaService.generateWordFile({
        collegename: "الحاسبات والذكاء الاصطناعي",
        name: "Omar Alashmony",
        nationalId: "30303030303030",
        titlePersonInefada1: "مدير المشروع",
        nameOfPersonInefada1: "د/ أحمد محمد",
        titlePersonInefada2: "المدير التنفيذي",
        nameOfPersonInefada2: "د/ محمد علي",
        date: "12/5/2026",
        qr_base64: "data:image/png;base64,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",
      });
  
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
  
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=efada.docx"
      );
  
      return res.send(buffer);
  
    } catch (error) {
  
      console.error(error);
  
      return res.status(500).json({
        success: false,
        message: "Error generating word file",
      });
    }
  },
};

module.exports = efadaController;
