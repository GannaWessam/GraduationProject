const { session: Session, training: Training,trainingReservation, sequelize,event,SessionMaterial } = require("../../../models/index");
const PaginatedResponse = require("../../../Util/PaginatedResponse");
const { generateSessionToken } = require("../../../Util/SessionToken");
const { Op } = require("sequelize");
const path = require("path");
const fs = require("fs");
const QRCode = require("qrcode");
const archiver = require("archiver");

const sessionService = {






  async   createSession(sessionData) {
    // 1) تأكد إن ال training موجود
    const trainingObj = await Training.findByPk(sessionData.trainingId, {
    include: [{ model: event, as: "event" }] 
  });
  if (!trainingObj) {
    throw new Error("Training not found");
  }

  const eventObj = trainingObj.event;

    if (new Date(sessionData.date) < new Date(eventObj.startDate)) {
    throw new Error(`Session date cannot be before event start date (${eventObj.startDate.toISOString().split('T')[0]})`);
  }
    if (new Date(sessionData.date) > new Date(eventObj.endDate)) {
    throw new Error(`Session date cannot be aftar event start date (${eventObj.startDate.toISOString().split('T')[0]})`);
  }
    const eventId = trainingObj.eventId;
  
    // 2) هات كل ال trainings اللي جوه نفس ال event
    const trainingsInEvent = await Training.findAll({
      where: { eventId },
      attributes: ["trainingId"]
    });
  
    const trainingIdsInEvent = trainingsInEvent.map(t => t.trainingId);
  
    // 3) اعمل تشيك تداخل
    const conflict = await Session.findOne({
      where: {
        date: sessionData.date,
        trainingId: {
          [Op.in]: trainingIdsInEvent   
        },
        // overlap condition
        [Op.and]: [
          { startTime: { [Op.lt]: sessionData.endTime } },
          { endTime: { [Op.gt]: sessionData.startTime } }
        ]
      }
    });
  
    if (conflict) {
      throw new Error("Session time overlaps with another session in the same training or event");
    }
  
    // 4) create session
    const newSession = await Session.create({
      ...sessionData,
    });
  
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

  async updateSession(id, data) {
    return sequelize.transaction(async (t) => {
      const session = await Session.findByPk(id, { transaction: t });
      if (!session) throw new Error("session_not_found");

      await session.update(data, { transaction: t });
      return session;
    });
  },

  async deleteSession(id) {
    return sequelize.transaction(async (t) => {
      const session = await Session.findByPk(id, { transaction: t });
      if (!session) throw new Error("session_not_found");

      await session.destroy({ transaction: t });
      return { message: "Session deleted successfully" };
    });
  },

  async getUserActiveSessions(userId) {
    return trainingReservation.findAll({
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
                "virtualLink"
              ]
            }
          ]
        }
      ]
    });
  },

  async uploadSessionMaterialService (sessionId, files) {
    if (!files || files.length === 0) {
      throw new Error("No files uploaded");
    }
  
    const materials = files.map((file) => {
      const ext = file.originalname.split(".").pop().toLowerCase();
      if (!["pdf", "zip"].includes(ext)) {
        throw new Error("Invalid file type: " + file.originalname);
      }
  
      return {
        sessionId,
        file: `sessions/${file.filename}`,
        fileType: ext,
        name: file.originalname,
      };
    });
  
    const createdMaterials = await SessionMaterial.bulkCreate(materials);
    return createdMaterials;
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
        // استخدم الاسم المخصص لو موجود، وإلا استخدم اسم الملف الأصلي
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

    const token = generateSessionToken(session.id, session.name, session.trainingId);

    const url = `http://localhost:3000/attendance/scan?token=${token}`;

    const qr = await QRCode.toDataURL(url);

    return {qr, url};

  },



};

module.exports = sessionService;
