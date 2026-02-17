// src/services/payment.service.js
const axios = require('axios');



const createPayment = async ({
    billingDetails,
    receiptIds,
    studentReferenceId
  }) => {
  
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
          "Accept": "*/*"
        }
      }
    );
  
    return response.data.data.formData; 
  };

module.exports = {
  createPayment
};
