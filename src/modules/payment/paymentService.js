const {Payment , Student ,Product ,webhook ,sequelize} = require("../../models");
const PaginatedResponse = require("../../Util/PaginatedResponse");
const axios = require('axios');
const crypto = require("crypto");
const secretKey = process.env.WEBHOOK_SECRET;
const { verifySignature } = require("./helper/Webhook");



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
    redirectUrl: "https://attendance.capu.edu.eg/",
  };

  const response = await axios.post(
    "https://lms2.capu.edu.eg/api/api/payments/eFinance/initiate",
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

const getPaymentsByUserId = async (userId) => {
  return await Payment.findAll({
    where: { userId },
    attributes: [
      "paymentId",
      "userId",
      "productId",
      "amount",
      "status",
      "timestamp",
      "receiptId"
    ],
    include: [
      {
        model: Product,
        attributes: ["courseName"]
      }
    ],
    order: [["timestamp", "DESC"]],
  });
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

    // التحقق من idempotency
    const existing = await webhook.findOne({ where: { webhookId }, transaction: t });
    if (existing) {
      await t.commit();
      return true;
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
    if (body.transaction.netAmount !== undefined) {
      paymentData.actualAmount = body.transaction.netAmount;
    }
    await paymentData.save({ transaction: t });

    await t.commit();
    return true;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

module.exports = {
  createPayment,
  getPaymentsByUserId,
  getAllPayments,
  processWebhook
};
