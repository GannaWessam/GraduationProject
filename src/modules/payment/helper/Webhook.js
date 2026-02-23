const crypto = require("crypto");

const verifySignature = (rawBody, signatureHeader, secretKey) => {
  if (!rawBody || !signatureHeader) return false;

  const expectedSignature = crypto
    .createHmac("sha256", secretKey)
    .update(rawBody, "utf8")
    .digest("base64");

console.log(expectedSignature)
  const expectedBuffer = Buffer.from(expectedSignature, "base64");
  const receivedBuffer = Buffer.from(signatureHeader, "base64");

  if (expectedBuffer.length !== receivedBuffer.length) return false;

  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
};  


const MAX_WEBHOOK_AGE_MS = 5 * 60 * 1000; 

const validateWebhookTimestamp = (timestampHeader) => {
  const timestamp = Number(timestampHeader);

  if (Number.isNaN(timestamp)) {
    const error = new Error("Invalid webhook timestamp format");
    error.statusCode = 400;
    throw error;
  }

  const now = Date.now();

  if (now - timestamp > MAX_WEBHOOK_AGE_MS) {
    const error = new Error("Webhook is too old");
    error.statusCode = 400;
    throw error;
  }

  return true;
};


module.exports = {
  verifySignature,
  validateWebhookTimestamp,
};