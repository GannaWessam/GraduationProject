const {Payment , Student ,Product ,webhook ,sequelize, Service, currency , studentCourse ,Reexam , exam , Register, User ,userReceipts} = require("../../models");
const PaginatedResponse = require("../../Util/PaginatedResponse");
const axios = require('axios');
const crypto = require("crypto");
const secretKey = process.env.WEBHOOK_SECRET;
const { verifySignature , validateWebhookTimestamp, signRequest } = require("./helper/Webhook");
const { Op } = require("sequelize");
const SYSTEM_IDENTIFIER = process.env.TREASURY_SYSTEM_IDENTIFIER;
const BASE_URL = process.env.RECEIPTS_BASE_URL;





const createPayment = async ({
  paymentId,
  email,
  receiptIds,
  userId,
  req
}) => {
  const user = await Student.findOne({ where: { userId } });
  if (!user) throw new Error("User not found");

  const existingPayment = await Payment.findOne({ where: { paymentId, userId } });
  if (!existingPayment) throw new Error("Payment not found");

  const nameParts = user.fullName.trim().split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts[nameParts.length - 1];

  const requestBody = {
    billingDetails: {
      firstName,
      lastName,
      emailAddress: email,
      mobileNumber: user.Mobile,
      currency: "EGP",
    },
    receiptIds,
    studentReferenceId: user.nationalId,
    paymentMechanism: "NOT_SET",
    description: "string",
    redirectUrl: "https://fdtc.capu.edu.eg/pay-fees",
  };

  const bodyString = JSON.stringify(requestBody);
  const path = "/api/payments/test/eFinance/initiate-payment";

  const { timestamp, signature } = signRequest("POST", path, "", bodyString,secretKey);

  const response = await axios.post(
    BASE_URL + path,
    bodyString,
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
        "X-System-Identifier": SYSTEM_IDENTIFIER,
        "X-Timestamp": timestamp,
        "X-Signature": signature,
      },
    }
  );

  const data = response.data.data;
  if (!data?.merchantOrderId || !data?.html) {
    throw new Error("Invalid response from payment API");
  }

  await existingPayment.update({ orderId: data.merchantOrderId, status: "PENDING" });

  if (req?.audit) {
    req.audit.user = {
      _id: req.userData.id,
      name: req.userData.name,
      email: req.userData.email,
    };
    req.audit.message =
      "User Redirected to payment platform successfully | تم توجيه المستخدم إلى منصة الدفع بنجاح";
  }

  return { html: data.html, paymentRecord: existingPayment };
};

const getPaymentsByUserId = async (userId,features) => {
  const page = features.page * 1 || 1;
    const limit = features.limit * 1 || 10;
    const offset = (page - 1) * limit;
  const {rows,count}= await Payment.findAndCountAll({
    where: { userId },
    limit,
    offset,
    attributes: [
      "paymentId",
      "userId",
      "productId",
      "amount",
      "status",
      "timestamp",
      "receiptId",
      "serviceId"
    ],
    include: [
      {
        model: Product,
        attributes: ["courseName"]
      },
      {
        model:Service,
        attributes:["name"]
      },
      {
        model:currency,
        attributes:["code"]
      },
      {
        model: userReceipts,
        as: "receipt",
        attributes: ["receipt"],
        required: false,
      },
    ],
    order: [["timestamp", "DESC"]],
  });
  return PaginatedResponse.fromApiFeature(
    features,
    count,
    rows,
    "Fees fetched successfully"
  );
};
const getPendingPaymentsByUserId = async (userId,features) => {
  const page = features.page * 1 || 1;
  const limit = features.limit * 1 || 10;
  const offset = (page - 1) * limit;
  const {rows,count}= await Payment.findAndCountAll({
    where:{
      userId,
      status: {
        [Op.ne]: "PAID"
      }
    },
    limit,
    offset,
    attributes: [
      "paymentId",
      "userId",
      "productId",
      "amount",
      "status",
      "timestamp",
      "receiptId",
      "serviceId"
    ],
    include: [
      {
        model: Product,
        attributes: ["courseName"]
      },
      {
        model:Service,
        attributes:["name"]
      },
      {
        model:currency,
        attributes:["code"]
      },
      {
        model: userReceipts,
        as: "receipt",
        attributes: ["receipt"],
        required: false,
      },
    ],
    order: [["timestamp", "DESC"]],
  });
  return PaginatedResponse.fromApiFeature(
    features,
    count,
    rows,
    "Fees fetched successfully"
  );
};



const getAllPayments = async (features) => {
  try {
    const opts = { ...(features.options || {}) };

    const queryOptions = {
      attributes: [
        "paymentId",
        "userId",
        "productId",
        "actualAmount",
        "status",
        "timestamp"
      ],
      include: [
        {
          model: Student,
          attributes: ["fullName", "Mobile","NameEn","nationalId"]
        },
        {
          model: Product,
          attributes: ["courseName"]
        },
        {
          model:Service,
          attributes:["name"]
        },
        {
          model:currency,
          attributes:["code"]
        }
      ],
      where: opts.where || {},
      order: [["timestamp", "DESC"]],
      limit: opts.limit,
      offset: opts.offset,
      attributes: opts.attributes,
      distinct: true
    };

    const { count, rows } =
      await Payment.findAndCountAll(queryOptions);

    return PaginatedResponse.fromApiFeature(
      features,
      count,
      rows,
      "Payments fetched successfully"
    );

  } catch (error) {
    throw new Error("failed_to_fetch_payments");
  }
};







const processWebhook = async ({ signature, webhookId, event, timestamp, rawBody, body,req }) => {
  const t = await sequelize.transaction();

  try {
    // تحقق من signature
    const isValid = verifySignature(rawBody, signature, secretKey);
    if (!isValid) {
      const error = new Error("Unauthorized - Invalid or missing signature");
      error.statusCode = 401;
      throw error;
    }

    validateWebhookTimestamp(timestamp);

    // التحقق من idempotency
    const existing = await webhook.findOne({ where: { webhookId }, transaction: t });
    if (existing) {
      const error = new Error("Conflict - Webhook already processed");
      error.statusCode = 409;
      throw error;
    }

    // تخزين webhook
    await webhook.create({ webhookId, webhookEvent: event }, { transaction: t });

    // تحديث بيانات الدفع
    const paymentData = await Payment.findOne({ where: { orderId: body.transaction.merchantOrderId }, transaction: t });
    if (!paymentData) {
      const error = new Error("Bad request - Invalid payload format");
      error.statusCode = 400;
      throw error;
    }

    let student;

    paymentData.status = body.transaction.status;
    if (body.transaction.grossAmount !== undefined) {
      paymentData.actualAmount = body.transaction.grossAmount;
    }
    paymentData.timestamp=timestamp;
    await paymentData.save({ transaction: t });

    if (
      body.transaction.previousStatus !== "PAID" &&
      body.transaction.status === "PAID" &&
      paymentData.productId
    ) {

      const product = await Product.findByPk(paymentData.productId, {
        transaction: t
      });

      if (!product) {
        throw new Error("Product not found");
      }

      await studentCourse.update(
        {
          examStatus: product.examStatus ? "pending" : null,
          trainingStatus: product.trainingStatus ? "pending" : null
        },
        {
          where: { userId: paymentData.userId },
          transaction: t
        }
      );
      const [count, updatedStudents]=await Student.update({
        status:"PAID"
      },
      {
        where:{userId:paymentData.userId},
        transaction:t,
        returning: true
      }
    )
    student=updatedStudents[0];
    }

    if (
      body.transaction.previousStatus !== "PAID" &&
      body.transaction.status === "PAID" &&
      !paymentData.productId &&
      paymentData.serviceId
    ) {
    
      
      const reexamRequest = await Reexam.findOne({
        where: { paymentId: paymentData.paymentId },
        transaction: t
      });
    
  
      if (reexamRequest) {
    
        const examData = await exam.findByPk(reexamRequest.examId, {
          transaction: t
        });
    
        if (!examData) {
          throw new Error("Exam not found");
        }
    

        await studentCourse.update(
          {
            examStatus: "pending"
          },
          {
            where: {
              userId: reexamRequest.userId,
              courseId: examData.courseId
            },
            transaction: t
          }
        );
        student=await Student.findOne({ where: { userId: reexamRequest.userId }, transaction: t });
      }
    }

    await t.commit();
    if (req && req.audit) {
      req.audit.affectedUser = {
        _id: paymentData.userId,
        name: student ? student.fullName : null,
      };
      req.audit.message =
        "Webhook received and processed successfully | تم استلام الويب هوك ومعالجته بنجاح";
    }
    return true;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

async function handleUserPaymentAndRegistration(paymentId, req) {
  const t = await sequelize.transaction();

  try {

    const paymentData = await Payment.findOne({
      where: { paymentId }, 
      transaction: t
    });

    if (!paymentData) {
      const error = new Error("Bad request - Invalid payload format");
      error.statusCode = 400;
      throw error;
    }

    let student;

    // ✅ Product case
    if (
      paymentData.status !== "PAID" &&
      paymentData.productId
    ) {

      paymentData.status = "PAID";
      paymentData.actualAmount=paymentData.amount
      paymentData.timestamp=new Date();
      await paymentData.save({ transaction: t });

      const product = await Product.findByPk(paymentData.productId, {
        transaction: t
      });

      if (!product) {
        throw new Error("Product not found");
      }

      await studentCourse.update(
        {
          examStatus: product.examStatus ? "pending" : null,
          trainingStatus: product.trainingStatus ? "pending" : null
        },
        {
          where: { userId: paymentData.userId },
          transaction: t
        }
      );
      const [count, updatedStudents] =await Student.update({
        status:"PAID"
      },
      {
        where:{userId:paymentData.userId},
        transaction:t,
        returning: true
      }
    )
    student=updatedStudents[0];
    await User.increment("tokenVersion", { where: { userId: paymentData.userId } });
    }

    // ✅ Service (re-exam) case
    if (
      paymentData.status !== "PAID" &&
      !paymentData.productId &&
      paymentData.serviceId
    ) {
      
      paymentData.status = "PAID";
      paymentData.actualAmount=paymentData.amount
      paymentData.timestamp=new Date();
      await paymentData.save({ transaction: t });
      const reexamRequest = await Reexam.findOne({
        where: { paymentId: paymentData.paymentId },
        transaction: t
      });

      if (reexamRequest) {
        const examData = await exam.findByPk(reexamRequest.examId, {
          transaction: t
        });

        if (!examData) {
          throw new Error("Exam not found");
        }

        await studentCourse.update(
          {
            examStatus: "pending"
          },
          {
            where: {
              userId: reexamRequest.userId,
              courseId: examData.courseId
            },
            transaction: t
          }
        );
        student=await Student.findOne({ where: { userId: reexamRequest.userId }, transaction: t });
      }
    }


    if (req) {
      req.audit = req.audit || {};
      req.audit.affectedUser = {
        _id: paymentData.userId,
        name:student.fullName,
      };
      req.audit.message =
        "User payment handled and course registered successfully | تم تأكيد الدفع للمستخدم بنجاح";
    }

    await t.commit();

    return { message: "Process completed successfully" };

  } catch (error) {
    await t.rollback();
    throw error;
  }
}

const createReceipt = async ({ userId, paymentId, receipt }) => {

  const newReceipt = await userReceipts.create({
    userId,
    paymentId,
    receipt,
  });

  return newReceipt;
};

const getAllReceipts = async (userId,features) => {

  const page = features.page * 1 || 1;
  const limit = features.limit * 1 || 10;
  const offset = (page - 1) * limit;

  const { rows, count } = await Payment.findAndCountAll({
    where: {
      userId,
      status: {
        [Op.ne]: "PAID",
      },
    },

    limit,
    offset,
    distinct: true,
    attributes: [
      "paymentId",
      "userId",
      "productId",
      "amount",
      "status",
      "timestamp",
      "serviceId",
    ],

    include: [
      {
        model: Product,
        attributes: ["courseName"],
      },
      {
        model: Service,
        attributes: ["name"],
      },
      {
        model: currency,
        attributes: ["code"],
      },

      {
        model: userReceipts,
        as: "receipt",
        attributes: ["receipt"],
        required: false,
      },
    ],

    order: [["timestamp", "DESC"]],
  });

  return PaginatedResponse.fromApiFeature(
    features,
    count,
    rows,
    "Fees fetched successfully"
  );
};

const manualFetchReceipts=async() => {
  try {
    const response = await axios.get(`${process.env.RECEIPTS_BASE_URL}/api/payments/receipts`, {
      params: {
        connectionTypeIds: 5,
      },
    });
    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    console.log(error);
    
    throw new Error("Failed to fetch receipts from external API");
  }
}





module.exports = {
  createPayment,
  getPaymentsByUserId,
  getAllPayments,
  processWebhook,
  handleUserPaymentAndRegistration,
  getPendingPaymentsByUserId,
  createReceipt,
  getAllReceipts,
  manualFetchReceipts
};
