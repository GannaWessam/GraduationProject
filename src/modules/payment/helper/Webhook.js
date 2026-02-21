const crypto = require("crypto");

const verifySignature = (body, signatureHeader, secretKey) => {
    const expected = crypto
      .createHmac("sha256", secretKey)
      .update(body, "utf8")
      .digest("base64");

    return expected === signatureHeader;
  };

module.exports = {
  verifySignature,
};