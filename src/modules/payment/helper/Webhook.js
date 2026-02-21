const crypto = require("crypto");

const verifySignature = (rawBody, signatureHeader, secretKey) => {
  if (!rawBody || !signatureHeader) return false;

  const expectedSignature = crypto
    .createHmac("sha256", secretKey)
    .update(rawBody, "utf8")
    .digest("base64");


  const expectedBuffer = Buffer.from(expectedSignature, "base64");
  const receivedBuffer = Buffer.from(signatureHeader, "base64");

  if (expectedBuffer.length !== receivedBuffer.length) return false;

  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
};


module.exports = {
  verifySignature,
};