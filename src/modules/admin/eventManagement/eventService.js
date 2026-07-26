const {
  event,
  exam,
  training,
  course,
  User,
  Student,
  reservation,
  trainer,
  supervisor,
  sequelize,
  Conversation,ConversationUser,
  Product
} = require("../../../models/index.js");
const ApiFeature = require("../../../Util/ApiFeatures");
const PaginatedResponse = require("../../../Util/PaginatedResponse");
const { Op } = require("sequelize");
const {
  handleCreateGroupChatForEvent,
} = require("../../user/reserveEvents/helpers/helper");

const ExcelJS = require("exceljs");
const { splitLang } = require("../../../Helpers/langHelper");

const getAllEvents = async (features) => {
  try {
    const opts = { ...(features.options || {}) };
    const baseWhere = opts.where || {};

    // handle courseId specially
    const courseIdFilter = baseWhere.courseId;
    if (courseIdFilter) delete baseWhere.courseId;

    // handle trainerId specially
    const trainerIdFilter = baseWhere.trainerId;
    if (trainerIdFilter) delete baseWhere.trainerId;

    const productInclude={
      model:Product,
      attributes:["courseName"]
    }

    const examInclude = {
      model: exam,
      as: "exams",
      required: false,
      include: [
        { model: course, attributes: ["name"] },
        { model: supervisor, as: "supervisor", attributes: ["Name"] },
      ],
    };

    const trainingInclude = {
      model: training,
      as: "trainings",
      required: trainerIdFilter ? true : false, // include only if filtering
      where: trainerIdFilter ? { trainerId: trainerIdFilter } : undefined,
      include: [
        { model: course, attributes: ["name"] },
        { model: trainer, as: "trainer", attributes: ["Name"] },
      ],
    };

    // OR condition for courseId only
    if (courseIdFilter) {
      baseWhere[Op.or] = [
        { ["$exam.courseId$"]: courseIdFilter },
        { ["$trainings.courseId$"]: courseIdFilter },
      ];
    }

    const queryOptions = {
      include: [examInclude, trainingInclude,productInclude],
      where: baseWhere,
      order: opts.order || [["createdAt", "DESC"]],
      limit: opts.limit,
      offset: opts.offset,
      attributes: opts.attributes,
      distinct: true,
    };

    const { count, rows: events } = await event.findAndCountAll(queryOptions);

    return PaginatedResponse.fromApiFeature(
      features,
      count,
      events,
      "All events fetched successfully",
    );
  } catch (error) {
    throw new Error("failed_to_fetch_events");
  }
};

// Get event by ID (both training and exam events)
const getEventById = async (eventId) => {
  try {
    // First get the event to check its type
    const eventt = await event.findByPk(eventId);

    if (!eventt) {
      throw new Error("Event not found");
    }

    // Convert the event instance to plain object
    const eventObj = eventt.get({ plain: true });

    if (eventObj.type === "training") {
      // Find the training associated with this event
      const trainingg = await training.findAll({
        where: { eventId: eventId },
        include: [
          { model: course, attributes: ["name"] },
          { model: trainer, as: "trainer", attributes: ["Name"] },
          {
            model: event,
            as: "event",
            attributes: [
              "eventId",
              "eventName",
              "startDate",
              "endDate",
              "capacity",
              "numberOfRegistered",
              "status",
              "type",
            ],
          },
        ],
      });

      eventObj.trainings = trainingg.map((t) => t.get({ plain: true }));
      return eventObj;
    } else if (eventObj.type === "exam") {
      // Find the exams associated with this event
      const examm = await exam.findAll({
        where: { eventId: eventId },
        include: [
          { model: course, attributes: ["name"] },
          { model: supervisor, as: "supervisor", attributes: ["Name"] },
          {
            model: event,
            as: "event",
            attributes: [
              "eventId",
              "eventName",
              "startDate",
              "endDate",
              "capacity",
              "numberOfRegistered",
              "status",
              "type",
            ],
          },
        ],
      });

      // Convert exam instances to plain objects
      eventObj.exams = examm.map((e) => e.get({ plain: true }));

      return eventObj;
    } else {
      throw new Error("Invalid event type");
    }
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch event");
  }
};

const closeEventById = async (eventId,req) => {
  const eventInstance = await event.findByPk(eventId);
  if (!eventInstance) {
    throw new Error("Event not found");
  }
  eventInstance.status = "closed";
  const updatedEvent = await eventInstance.save(); //=> offline update
  if (updatedEvent) {
    await handleCreateGroupChatForEvent(
      eventInstance.eventId,
      eventInstance.eventName,
      eventInstance.type,
    );
    if (req && req.audit) {
      req.audit.affectedThing = { _id: eventInstance.eventId , name: eventInstance.eventName };
      req.audit.user = { _id: req.userData.id, name: req.userData.name, email: req.userData.email };
      req.audit.message =
        "Event closed successfully | تم إغلاق الفعالية بنجاح";
    }
    return "event closed successfully";
  }

  throw new Error("Failed to close event");
};

const updateEvent = async (eventId, updateData,req) => {
  return sequelize.transaction(async (t) => {
    const eventt = await event.findByPk(eventId, { transaction: t });
    if (!eventt) throw new Error("event_not_found");

    const allowedFields = [
      "eventName",
      "startDate",
      "endDate",
      "startDateRes",
      "endDateRes",
      "capacity",
      "status",
      "language",
    ];

    for (const key of allowedFields) {
      if (updateData[key] !== undefined) {
        eventt[key] = updateData[key];
      }
    }

    await eventt.save({ transaction: t });

    if (req && req.audit) {
      req.audit.affectedThing = { _id: eventt.eventId , name: eventt.eventName };
      req.audit.user = { _id: req.userData.id, name: req.userData.name, email: req.userData.email };
      req.audit.message =
        "Event updated successfully | تم تحديث الفعالية بنجاح";
    }

    return eventt;
  });
};

const deleteEventById = async (eventId,req) => {
  return sequelize.transaction(async (t) => {
    const eventInstance = await event.findByPk(eventId, { transaction: t });

    if (!eventInstance) {
      throw new Error("event_not_found");
    }

    await eventInstance.destroy({ transaction: t });

    if (req && req.audit) {
      req.audit.affectedThing = { _id: eventInstance.eventId , name: eventInstance.eventName };
      req.audit.user = { _id: req.userData.id, name: req.userData.name, email: req.userData.email };
      req.audit.message =
        "Event deleted successfully | تم حذف الفعالية بنجاح";
    }

    return "Event and all related data deleted successfully";
  });
};

const deleteEventService = async (eventId,req) => {
  const transaction = await sequelize.transaction();

  try {
    const Event = await event.findByPk(eventId, { transaction });

    if (!Event) {
      throw new Error("Event not found");
    }

    // prevent delete if registered students exist
    if (Event.numberOfRegistered > 0) {
      throw new Error(
        "Cannot delete event because students are registered | لا يمكن حذف الفعالية لوجود طلاب مسجلين",
      );
    }

    const reservationCount = await reservation.count({
      where: { eventId },
      transaction,
    });

    // secure validation
    if (reservationCount > 0) {
      throw new Error(
        "Cannot delete event because students are registered | لا يمكن حذف الفعالية لوجود طلاب مسجلين",
      );
    }

    // delete linked exams
    await exam.destroy({
      where: { eventId },
      transaction,
    });

    // delete linked trainings
    await training.destroy({
      where: { eventId },
      transaction,
    });

    // delete event
    await Event.destroy({ transaction });

    await transaction.commit();

    if (req && req.audit) {
      req.audit.affectedThing = { _id: Event.eventId , name: Event.eventName };
      req.audit.user = { _id: req.userData.id, name: req.userData.name, email: req.userData.email };
      req.audit.message =
        "Event deleted successfully | تم حذف الفعالية بنجاح";
    }

    return {
      success: true,
      message: "Event deleted successfully | تم حذف الفعالية بنجاح",
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};


const changeEventStatusService = async (eventId) => {
  const transaction = await sequelize.transaction();

  try {
    const eventData = await event.findByPk(eventId, { transaction });

    if (!eventData) {
      throw new Error("Event not found");
    }

    if (eventData.status !== "closed") {
      throw new Error("Event is already open");
    }

    const now = new Date();

    if (now >= eventData.startDate) {
      throw new Error("The event cannot be reopened after its start date");
    }

    
    await eventData.update(
      {
        status: "opend",
      },
      {
        transaction,
      }
    );

    
    const conversation = await Conversation.findOne({
      where: { eventId },
      transaction,
    });

    if (conversation) {
      await ConversationUser.destroy({
        where: {
          conversationId: conversation.conversationId,
        },
        transaction,
      });

    
      await Conversation.destroy({
        where: {
          conversationId: conversation.conversationId,
        },
        transaction,
      });
    }

    await transaction.commit();

    return {
      message: "Event reopened successfully",
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};


const exportEventReservations = async (features,eventId) => {
  // 1️⃣ Check if event exists
  const eventData = await event.findByPk(eventId);

  if (!eventData) {
    throw new Error("event_not_found");
  }

  const options = features.options || {};
  
  const {rows} = await reservation.findAndCountAll({
    where: {
      eventId,
    },
    attributes: [],
    include: [
      {
        model: Student,
        attributes: [
          "userId",
          "fullName",
          "NameEn",
          "Mobile",
          "nationalId",
          "college",
          "university",
          "department",
        ],
        include: [
          {
            model: User,
            attributes: ["email"],
          },
        ],
        where: options.where || {},
      },
    ],
    limit: options.limit,
    offset: options.offset,
    order: options.order,
    distinct: true,
  });

  // 3️⃣ Create workbook
  const workbook = new ExcelJS.Workbook();

  // 4️⃣ Create worksheet
  const worksheet = workbook.addWorksheet("الحجوزات");

  // 5️⃣ RTL + freeze header
  worksheet.views = [
    {
      rightToLeft: true,
      state: "frozen",
      ySplit: 1,
    },
  ];

  // 6️⃣ Same columns as exportUsersExcel
  worksheet.columns = [
    {
      header: "الاسم بالكامل",
      key: "fullName",
      width: 35,
    },
    {
      header:"الاسم بالإنجليزية",
      key:"NameEn",
      width:25
    },
    {
      header: "الرقم القومي",
      key: "nationalId",
      width: 25,
    },
    {
      header: "رقم الهاتف",
      key: "mobile",
      width: 20,
    },
    {
      header: "الكلية",
      key: "college",
      width: 35,
    },
    {
      header: "البريد الإلكتروني",
      key: "email",
      width: 35,
    },
    {
      header: "القسم",
      key: "department",
      width: 35,
    },
  ];

  // 7️⃣ Add reservation data
  rows.forEach((reservationData) => {
    const student = reservationData.Student;

    worksheet.addRow({
      fullName: student?.fullName || "",

      NameEn: student?.NameEn || "",

      nationalId: student?.nationalId || "",

      mobile: student?.Mobile || "",

      college: student?.college
        ? splitLang(student.college).ar
        : "",

      email: student?.User?.email || "",

      department: student?.department || "",
    });
  });

  // 8️⃣ Header style
  const headerRow = worksheet.getRow(1);

  headerRow.height = 30;

  headerRow.font = {
    bold: true,
    size: 12,
  };

  headerRow.alignment = {
    horizontal: "center",
    vertical: "middle",
    wrapText: true,
  };

  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: {
        argb: "D9EAD3",
      },
    };

    cell.border = {
      top: {
        style: "thin",
        color: { argb: "808080" },
      },
      left: {
        style: "thin",
        color: { argb: "808080" },
      },
      bottom: {
        style: "thin",
        color: { argb: "808080" },
      },
      right: {
        style: "thin",
        color: { argb: "808080" },
      },
    };
  });

  // 9️⃣ Style data rows
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    row.height = 25;

    const fillColor =
      rowNumber % 2 === 0
        ? "FFFFFF"
        : "F2F2F2";

    row.eachCell((cell) => {
      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
          argb: fillColor,
        },
      };

      cell.border = {
        top: {
          style: "thin",
          color: { argb: "D9D9D9" },
        },
        left: {
          style: "thin",
          color: { argb: "D9D9D9" },
        },
        bottom: {
          style: "thin",
          color: { argb: "D9D9D9" },
        },
        right: {
          style: "thin",
          color: { argb: "D9D9D9" },
        },
      };
    });
  });

  return workbook;
};

module.exports = {
  getAllEvents,
  getEventById,
  closeEventById,
  updateEvent,
  deleteEventById,
  deleteEventService,
  changeEventStatusService,
  exportEventReservations
};
