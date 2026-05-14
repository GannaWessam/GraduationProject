const {Payment , Student ,Product ,webhook ,sequelize, Service, currency , studentCourse ,Reexam , exam , Register, User ,userReceipts} = require("../../models");
const PaginatedResponse = require("../../Util/PaginatedResponse");
const axios = require('axios');
const crypto = require("crypto");
const secretKey = process.env.WEBHOOK_SECRET;
const { verifySignature , validateWebhookTimestamp } = require("./helper/Webhook");
const { Op } = require("sequelize");



const createPayment = async ({
  paymentId,
  email,
  receiptIds,
  userId,
}) => {
  const user = await Student.findOne({
    where: { userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const existingPayment = await Payment.findOne({
    where: { paymentId, userId },
  });

  if (!existingPayment) {
    throw new Error("Payment not found");
  }
  const fullName = user.fullName;
  const nameParts = fullName.trim().split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts[nameParts.length - 1];

  const billingDetails = {
    firstName,
    lastName,
    emailAddress: email,
    mobileNumber: user.Mobile,
    currency: "EGP",
  };

  const studentReferenceId = user.nationalId;

  const requestBody = {
    billingDetails,
    receiptIds,
    studentReferenceId,
    paymentMechanism: "NOT_SET",
    description: "string",
    redirectUrl: "https://lms4.capu.edu.eg/pay-fees",
  };

  const response = await axios.post(
    "https://nub.capu.edu.eg/api/api/payments/eFinance/initiate",
    requestBody,
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
      },
    }
  );

  const data = response.data.data;

  if (!data?.merchantOrderId || !data?.formData) {
    throw new Error("Invalid response from payment API");
  }

  await existingPayment.update({
    orderId: data.merchantOrderId,
    status: "PENDING",
  });

  return {
    formData: data.formData,
    paymentRecord: existingPayment,
  };
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
      }
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
      }
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
        }
      ],
      where: opts.where || {},
      order: opts.order || [["timestamp", "DESC"]],
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







const processWebhook = async ({ signature, webhookId, event, timestamp, rawBody, body }) => {
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

    paymentData.status = body.transaction.status;
    if (body.transaction.grossAmount !== undefined) {
      paymentData.actualAmount = body.transaction.grossAmount;
    }
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
      }
    }

    await t.commit();
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



    // ✅ Product case
    if (
      paymentData.status !== "PAID" &&
      paymentData.productId
    ) {

      paymentData.status = "PAID";
      paymentData.actualAmount=paymentData.amount
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
      await Student.update({
        status:"PAID"
      },
      {
        where:{userId:paymentData.userId},
        transaction:t
      }
    )
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
      }
    }


    if (req) {
      req.audit = req.audit || {};
      req.audit.affectedThing = {
        userId: paymentData.userId,
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





module.exports = {
  createPayment,
  getPaymentsByUserId,
  getAllPayments,
  processWebhook,
  handleUserPaymentAndRegistration,
  getPendingPaymentsByUserId,
  createReceipt,
  getAllReceipts
};
