const crypto = require("crypto");

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16; 
const KEY_LENGTH = 32; 


function encrypt(text, secretKey) {
const iv = crypto.randomBytes(IV_LENGTH);
const key = crypto.createHash("sha256").update(secretKey).digest().slice(0, KEY_LENGTH);

const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

let encrypted = cipher.update(text, "utf8", "hex");
encrypted += cipher.final("hex");

const authTag = cipher.getAuthTag(); 

return {
    iv: iv.toString("hex"),
    data: encrypted,
    tag: authTag.toString("hex"),
    };
}


function decrypt(encryptedData, secretKey) {
  const key = crypto.createHash("sha256").update(secretKey).digest().slice(0, KEY_LENGTH);
  const iv = Buffer.from(encryptedData.iv, "hex");
  const tag = Buffer.from(encryptedData.tag, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag); 

  let decrypted = decipher.update(encryptedData.data, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

module.exports = { encrypt, decrypt };
