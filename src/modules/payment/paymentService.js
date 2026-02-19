const {Payment , Student ,Product} = require("../../models");
const PaginatedResponse = require("../../Util/PaginatedResponse");
const axios = require('axios');





const createPayment = async ({
  email,
  receiptIds,
  userId
}) => {

  const user = await Student.findOne({
    where: { userId: userId } 
  });

  if (!user) {
    throw new Error("User not found");
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
    currency: "EGP"
  };

  const studentReferenceId = user.nationalId;

  
  const requestBody = {
    billingDetails,
    receiptIds,
    studentReferenceId,
    paymentMechanism: "NOT_SET",
    description: "string",
    redirectUrl: "https://attendance.capu.edu.eg/"
  };

  const response = await axios.post(
    "https://lms2.capu.edu.eg/api/api/payments/eFinance/initiate",
    requestBody,
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*"
      }
    }
  );

  const data = response.data.data;

  if (!data.merchantOrderId || !data.formData) {
    throw new Error("Data not found from payment API");
  }

  
  const newPayment = await Payment.create({
    userId: userId,
    receiptId: receiptIds[0],
    orderId: data.merchantOrderId,
    status: "PENDING"
  });

  
  return {
    formData: data.formData,
    paymentRecord: newPayment
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
      "timestamp"
    ],
    include: [
      {
        model: Student,
        attributes: ["fullName", "Mobile", "nationalId"]
      },
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
          attributes: ["fullName", "Mobile"]
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


module.exports = {
  createPayment,
  getPaymentsByUserId,
  getAllPayments
};
