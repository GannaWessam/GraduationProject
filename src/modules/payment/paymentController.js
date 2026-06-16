const paymentService = require('./paymentService');
const ApiFeature = require("../../Util/ApiFeatures");
const ApiResponse = require("../../Util/ApiResponse");
const ReportService = require("../../Services/ReportService");

const createPaymentAndRedirect = async (req, res) => {
  try {

    const userId = req.userData.id;
    const paymentId=req.params.id
    const { email, receiptIds} = req.body;

    const paymentData = await paymentService.createPayment({
      paymentId,
      email,
      receiptIds,
      userId,
      req
    });

    const html = paymentData.html;

    return res.send(html);

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Payment creation failed"
    });
  }
};


const getPaymentsByUserId = async (req, res, next) => {
  try {
    const features = new ApiFeature(req.query)
      .filter()
      .search()
      .sort()
      .pagination()
      .selectedFields();
    const { userId } = req.params;

    const payments = await paymentService.getPaymentsByUserId(userId,features);

    res.status(200).json(ApiResponse.success(payments,"Payment fetched successfully"));

  } catch (error) {
    next(error);
  }
};
const getPendingPaymentsByUserId = async (req, res, next) => {
  try {
    const features = new ApiFeature(req.query)
      .filter()
      .search()
      .sort()
      .pagination()
      .selectedFields();
    const { userId } = req.params;

    const payments = await paymentService.getPendingPaymentsByUserId(userId,features);

    res.status(200).json(ApiResponse.success(payments,"Payment fetched successfully"));

  } catch (error) {
    next(error);
  }
};



const getAllPayments = async (req, res, next) => {
  try {
    const features = new ApiFeature(req.query)
      .filter()
      .search()
      .sort()
      .pagination()
      .selectedFields();

    const result = await paymentService.getAllPayments(features);

    res
      .status(200)
      .json(ApiResponse.success(result, "Payments retrieved successfully"));

  } catch (error) {
    next(error);
  }
};


const handleWebhook = async (req, res, next) => {
  try {
   
    const signature = req.get("X-Webhook-Signature");
    const webhookId = req.get("X-Webhook-ID");
    const event = req.get("X-Webhook-Event");
    const timestamp = req.get("X-Webhook-Timestamp");

    
    if (!signature || !webhookId || !event || !timestamp) {
      return res.status(400).json({
        success: false,
        message: "Bad request - Missing required webhook headers",
      });
    }

    
    const rawBody = req.body instanceof Buffer ? req.body.toString("utf8") : JSON.stringify(req.body)
    
    await paymentService.processWebhook({
      signature,
      webhookId,
      event,
      timestamp,
      rawBody,
      body: req.body,
      req
    });

    return res.status(200).json({
      success: true,
      message: "Webhook received and processed successfully.",
    });
  } catch (error) {
    console.error("Error processing webhook:", error.message);
    next(error);
  }
};

async function handleUserPayment(req, res, next) {
  try {
    const result = await paymentService.handleUserPaymentAndRegistration(
      req.params.paymentId,
      req
    );

    return res.status(200).json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
}


const uploadReceiptController = async (req, res) => {
  try {

    const { userId, paymentId } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Receipt image is required",
      });
    }

    const receipt = await paymentService.createReceipt({
      userId,
      paymentId,
      receipt: req.file.filename,
    });

    return res.status(201).json({
      success: true,
      message: "Receipt uploaded successfully",
      data: receipt,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

const getAllReceiptsController = async (req, res ,next) => {
  try {
    const features = new ApiFeature(req.query)
      .filter()
      .search()
      .sort()
      .pagination()
      .selectedFields();
    const { userId } = req.params;

    const payments = await paymentService.getAllReceipts(userId,features);

    res.status(200).json(ApiResponse.success(payments,"Payment fetched successfully"));

  } catch (error) {
    next(error);
  }
};

const getReceiptsfromExternal=async(req,res,next) => {
  try {
    const result=await paymentService.manualFetchReceipts();
    res.status(200).json(ApiResponse.success(result,"Payment fetched successfully"));
  } catch (error) {
    next(error)
  }
}

const exportPaymentsController = async (req, res) => {
  const { status, type = "excel" } = req.query;

  const query = { ...req.query };
  delete query.type;

  const features = new ApiFeature(query)
    .filter()
    .search()
    .sort()
    .selectedFields();

  const result = await paymentService.exportPayments(
    features,
    status,
    type
  );

  if (type === "pdf") {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="payments.pdf"'
    );

    result.pipe(res);
    result.end();
    return;
  }

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  res.setHeader(
    "Content-Disposition",
    'attachment; filename="payments.xlsx"'
  );

  await result.xlsx.write(res);
  res.end();
};

module.exports = {
  createPaymentAndRedirect,
  getPaymentsByUserId,
  getAllPayments,
  handleWebhook,
  handleUserPayment,
  getPendingPaymentsByUserId,
  uploadReceiptController,
  getAllReceiptsController,
  getReceiptsfromExternal,
  exportPaymentsController
};