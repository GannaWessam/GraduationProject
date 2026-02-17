const paymentService = require('./paymentService');

const createPaymentAndRedirect = async (req, res) => {
  try {

    // لو عايز تاخد بيانات من الفرونت
    const { billingDetails, receiptIds, studentReferenceId } = req.body;

    const paymentData = await paymentService.createPayment({
      billingDetails,
      receiptIds,
      studentReferenceId
    });

    const { SenderID, RandomSecret, HashedRequestObject , RequestObject } = paymentData;

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

module.exports = {
  createPaymentAndRedirect
};