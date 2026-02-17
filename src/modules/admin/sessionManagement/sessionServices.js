const { session: Session, training: Training,trainingReservation, sequelize,event,SessionMaterial } = require("../../../models/index");
const PaginatedResponse = require("../../../Util/PaginatedResponse");
const { generateSessionToken } = require("../../../Util/SessionToken");
const { Op } = require("sequelize");
const path = require("path");
require('dotenv').config();
const fs = require("fs");
const QRCode = require("qrcode");
const archiver = require("archiver");
const { validateSession } = require("./helper/validateSession");

const sessionService = {






  async createSession(sessionData, req) {
    await validateSession(sessionData);

    const newSession = await Session.create(sessionData);

    if (req && req.audit) {
      req.audit.affectedThing = {
        _id: newSession.sessionId,
        name: newSession.name,
      };
      req.audit.message =
        "Session created successfully | تم إنشاء الجلسة بنجاح";
    }

  return newSession;
  },

  async getAllSessions(features) {
    const { count, rows } = await Session.findAndCountAll({
      ...features.options,
      distinct: true,
      include: [
        {
          model: Training,
          as: "sessionTraining",
          attributes: ["trainingId", "courseId"],
        },
      ],
    });

    return PaginatedResponse.fromApiFeature(
      features,
      count,
      rows,
      "Sessions fetched successfully"
    );
  },

  async getSessionById(id) {
    const session = await Session.findByPk(id, {
      include: [
        {
          model: Training,
          as: "sessionTraining",
          attributes: ["trainingId", "courseId"],
        },
      ],
    });

    if (!session) throw new Error("session_not_found");
    return session;
  },

  async getSessionByTrainingId(id) {
    const sessions = await Session.findAll({
      where: { trainingId: id },
      include: [
        {
          model: Training,
          as: "sessionTraining",
          attributes: ["trainingId", "courseId"]
        }
      ]
    });
  
    if (!sessions || sessions.length === 0) {
      throw new Error("session_not_found");
    }
  
    return sessions;
  },

  async getSessionsByEventId(eventId) {
    const sessions = await Session.findAll({
      include: [
        {
          model: Training,
          as: "sessionTraining", 
          attributes: ["trainingId", "courseId", "eventId"],
          where: { eventId }       
        }
      ]
    });
  
    if (!sessions || sessions.length === 0) {
      throw new Error("sessions_not_found");
    }
  
    return sessions;
  },

  async updateSession(id, data, req) {
    return sequelize.transaction(async (t) => {

      const session = await Session.findByPk(id, { transaction: t });
      if (!session) throw new Error("session_not_found");
  
      // دمج القديم مع الجديد
      const mergedData = {
        ...session.toJSON(),
        ...data
      };
  
      // 🔥 الفاليديشن مع استثناء نفس السيشن
      await validateSession(mergedData, id);
  
      await session.update(data, { transaction: t });

      if (req && req.audit) {
        req.audit.affectedThing = {
          _id: session.sessionId,
          name: session.name,
        };
        req.audit.message =
          "Session updated successfully | تم تحديث الجلسة بنجاح";
      }

      return session;
    });
  
  },

  async deleteSession(id, req) {
    return sequelize.transaction(async (t) => {
      const session = await Session.findByPk(id, { transaction: t });
      if (!session) throw new Error("session_not_found");

      await session.destroy({ transaction: t });

      if (req && req.audit) {
        req.audit.affectedThing = {
          _id: id,
          name: session.name,
        };
        req.audit.message =
          "Session deleted successfully | تم حذف الجلسة بنجاح";
      }

      return { message: "Session deleted successfully" };
    });
  },

  async getUserActiveSessions(userId) {
    return await trainingReservation.findAll({
      where: {
        userId,
        reservationStatus: { [Op.ne]: "CANCEL" },
        trainigStatus: "ACTIVE",
      },
      include: [
        {
          model: Training,
          include: [
            {
              model: Session,
              as: "sessions",
              attributes: [
                "sessionId",
                "name",
                "startTime",
                "endTime",
                "date",
                "virtualLink",
              ],
              include: [
                {
                  model: SessionMaterial,
                  as: "materials",
                  attributes: ["name"],
                },
              ],
            },
          ],
        },
      ],
    });
  },

  async uploadSessionMaterialService (sessionId, files, req) {
    if (!files || files.length === 0) {
      throw new Error("No files uploaded");
    }

  
    const materials = files.map((file) => {
      const ext = file.originalname.split(".").pop().toLowerCase();
      if (!["pdf", "zip","docx","ppt","pptx"].includes(ext)) {
        throw new Error("Invalid file type: " + file.originalname);
      }
      const originalName = Buffer.from(file.originalname, "latin1").toString("utf8");
      return {
        sessionId,
        file: `sessions/${file.filename}`,
        fileType: ext,
        name: originalName,
      };
    });
  
    const createdMaterials = await SessionMaterial.bulkCreate(materials);

    if (req && req.audit) {
      req.audit.affectedThing = {
        _id: sessionId,
      };
      req.audit.message =
        "Session materials uploaded successfully | تم رفع مواد الجلسة بنجاح";
    }

    return createdMaterials;
  },
  async deleteSessionMaterial(materialId, req) {
    const t = await sequelize.transaction();

    try {
      const material = await SessionMaterial.findOne({ 
        where: { materialId }, 
        transaction: t 
      });
  
      if (!material) {
        const error = new Error("Material not found");
        error.statusCode = 404;
        throw error;
      }
  
      // مسار الملف
      const filePath = path.join(process.cwd(), "uploads", "sessions", path.basename(material.file));
  
      // حذف السطر من الداتابيز أولاً
      await material.destroy({ transaction: t });
  
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // ممكن تتحول لـ async لو حابب
      }
  
      // commit للـ transaction
      await t.commit();

      if (req && req.audit) {
        req.audit.affectedThing = {
          _id: materialId,
          name: material.name,
        };
        req.audit.message =
          "Session material deleted successfully | تم حذف مادة الجلسة بنجاح";
      }

      return { message: "Material deleted successfully" };
    } catch (error) {
      // rollback لو أي حاجة فشلت
      await t.rollback();
      throw error;
    }
  },

  async downloadSessionMaterialsService(sessionId, res) {
    // جلب كل المواد المرتبطة بالـ session
    const materials = await SessionMaterial.findAll({
      where: { sessionId },
    });

    if (!materials || materials.length === 0) {
      throw new Error("No materials found for this session");
    }

    // إعداد اسم الـ ZIP النهائي
    const zipFileName = `session-${sessionId}-materials.zip`;

    // تهيئة archive
    const archive = archiver("zip", { zlib: { level: 9 } });

    // إعداد headers للـ response
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${zipFileName}`
    );

    // ربط الـ archive بالـ response
    archive.pipe(res);

    // إضافة كل الملفات للـ zip
    materials.forEach((material) => {
      const filePath = path.join(process.cwd(), "uploads", "sessions", path.basename(material.file));


      if (fs.existsSync(filePath)) {
        const fileNameInZip = material.name
          ? material.name + "." + material.fileType
          : path.basename(material.file);
        archive.file(filePath, { name: fileNameInZip });
      }
    });

    await archive.finalize(); // مهم جدًا لإنهاء الـ zip
  },

   async QRservice(sessionId) {

    const session = await Session.findByPk(sessionId);

    const token = generateSessionToken(session.sessionId, session.name, session.trainingId);

    const url = `${process.env.HOST}/Attendance?token=${token}`;

    const qr = await QRCode.toDataURL(url);

    return {qr, url};
  },

  async getSessionMaterialService(sessionId, features) {
    try {
      const { where: featureWhere, limit, offset, order } = features.options || {};
  
      const { count, rows } = await SessionMaterial.findAndCountAll({
        where: {
          sessionId,
          ...(featureWhere || {}),
        },
        attributes: ["materialId", "sessionId", "name", "file", "fileType"],
        distinct: true,
        limit,
        offset,
        order,
      });
  
      // نفس شكل object بتاع upload
      const mappedRows = rows.map((m) => ({
        materialId: m.materialId,
        sessionId: m.sessionId,
        name: m.name,
        file: m.file,
        fileType: m.fileType,
      }));
  
      // 👈 نستخدم PaginatedResponse من ApiFeature
      return PaginatedResponse.fromApiFeature(
        features,
        count,
        mappedRows,
        "Session materials fetched successfully"
      );
    } catch (error) {
      console.error(error);
      throw new Error("Failed to fetch session materials");
    }
  },

  async getAllSessionsMaterials(features) {
    const { count, rows } = await SessionMaterial.findAndCountAll({
      ...features.options,
      distinct: true,
      include: [
        {
          model: Session,
          attributes: ["name", "startTime", "endTime"],
        },
      ],
    });

    return PaginatedResponse.fromApiFeature(
      features,
      count,
      rows,
      "Sessions fetched successfully"
    );
  },

  async downloadSessionMaterial(materialId) {
    const material = await SessionMaterial.findOne({
      where: { materialId },
    });

    if (!material) {
      const error = new Error("Material not found");
      error.statusCode = 404;
      throw error;
    }

    const filePath = path.join(process.cwd(),  "uploads", "sessions", path.basename(material.file));
   
    if (!fs.existsSync(filePath)) {
      const error = new Error("File not found on server");
      error.statusCode = 404;
      throw error;
    }

    return {
      filePath,
      fileName: material.name || path.basename(filePath),
    };
  },

};

module.exports = sessionService;
