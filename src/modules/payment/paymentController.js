const paymentService = require('./paymentService');
const ApiFeature = require("../../Util/ApiFeatures");
const ApiResponse = require("../../Util/ApiResponse");

const createPaymentAndRedirect = async (req, res) => {
  try {

    const userId = req.userData.id;
    const { email, receiptIds} = req.body;

    const paymentData = await paymentService.createPayment({
      email,
      receiptIds,
      userId
    });

    const { SenderID, RandomSecret, HashedRequestObject , RequestObject } = paymentData.formData;

    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Redirecting...</title>
        <script>
          function submitForm() {
            document.getElementById('efinanceForm').submit();
          }
        </script>
      </head>
      <body onload='submitForm()'>
        <h3>Redirecting to Payment Gateway...</h3>
        <form id='efinanceForm' method='POST' action='https://test-payment.efinance.com.eg/CardPaymentRequestIntiation/index'>
          <input type='hidden' name='SenderID' value='${SenderID}' />
          <input type='hidden' name='RandomSecret' value='${RandomSecret}' />
          <input type='hidden' name='RequestObject' value='${RequestObject}' />
          <input type='hidden' name='HashedRequestObject' value='${HashedRequestObject}' />
        </form>
      </body>
      </html>
    `);

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
    const { userId } = req.params;

    const payments = await paymentService.getPaymentsByUserId(userId);

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });

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



module.exports = {
  createPaymentAndRedirect,
  getPaymentsByUserId,
  getAllPayments,
};