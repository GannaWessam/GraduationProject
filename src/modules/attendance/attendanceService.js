const {session, User, attendance ,Student} =
require("../../models/index");
const { Op } = require("sequelize");
const PaginatedResponse = require("../../Util/PaginatedResponse");
const { emit } = require("pdfkit");

const attendanceService = {

  // ✅ Create Attendance (Check-in)
  async createAttendance(userId, sessionId, req) {
    
    const Session = await session.findByPk(sessionId);
    if (!Session) throw new Error("session_not_found");

   
    const exists = await attendance.findOne({
      where: { userId, sessionId },
    });
    if (exists) throw new Error("attendance_already_exists");

    const record = await attendance.create({
      userId,
      sessionId,
    });
    
    if (req && req.audit) {
      req.audit.user = {
        _id: userId,
        name: req.userData.name,
        email: req.userData.email,
      };
      req.audit.message =
        "Attendance created successfully | تم تسجيل الحضور بنجاح";
    }

    return record;
  },

  // 📌 Get all attendance
  async getAllAttendance(features) {
    const { count, rows } = await attendance.findAndCountAll({
      ...features.options,
      distinct: true,
      include: [
        {
          model: Student,
          attributes: ["userId", "fullName"],
        },
        {
          model: session,
          attributes: ["sessionId", "name", "date", "startTime", "endTime"],
        },
      ],
    });

    return PaginatedResponse.fromApiFeature(
      features,
      count,
      rows,
      "Attendance fetched successfully"
    );
  },

  // 📌 Get attendance by id
  async getAttendanceById(id) {
    const Attendance = await attendance.findByPk(id, {
      include: [Student, session],
    });

    if (!Attendance) throw new Error("attendance_not_found");
    return Attendance;
  },

  // 📌 Get attendance by session
  async getAttendanceBySession(sessionId, features) {
    try {
      const {
        where: featureWhere,
        limit,
        offset,
        order,
        attributes,
      } = features.options || {};
      const {count,rows} =await attendance.findAndCountAll({
        where: {
          sessionId,
          ...(featureWhere || {}),
        },
        distinct: true,
        limit,
        offset,
        order,
        attributes,
        include: [
          {
            model: Student,
          },
        ],
      });
      return PaginatedResponse.fromApiFeature(
        features,
        count,
        rows,
        "Attendance fetched successfully"
      );
    } catch (error) {
      console.error(error);
      throw new Error("Failed to fetch Attendance for this session");
    }
  },
  

  // 📌 Get attendance by user
  async getAttendanceByUser(userId,features) {
    try {
        const {
          where: featureWhere,
          limit,
          offset,
          order,
          attributes,
        } = features.options || {};
        const {count,rows} =await attendance.findAndCountAll({
          where: {
            userId,
            ...(featureWhere || {}),
          },
          distinct: true,
          limit,
          offset,
          order,
          attributes,
          include: [
            {
              model: session,
              attributes:["name"]
            },
          ],
        });
        return PaginatedResponse.fromApiFeature(
          features,
          count,
          rows,
          "Attendance fetched successfully"
        );
    } catch (error) {
      console.error(error);
      throw new Error("Failed to fetch Attendance for this session");
    }
  },

  // ❌ Delete attendance
  async deleteAttendance(id, req) {
    const Attendance = await attendance.findByPk(id);
    if (!Attendance) throw new Error("attendance_not_found");

    await Attendance.destroy();

    if (req && req.audit) {
      req.audit.message =
        "Attendance deleted successfully | تم حذف سجل الحضور بنجاح";
    }

    return { message: "Attendance deleted successfully" };
  },
};

module.exports = attendanceService;