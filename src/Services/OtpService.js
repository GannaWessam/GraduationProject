const crypto = require("crypto");
const RedisService = require("./Redies_Connection");
const MailService = require("./Mail_Service");

class OtpService {
  constructor(mailUser, mailPass) {
    this.redis = new RedisService();
    this.redis.connect();
    this.mailer = new MailService(mailUser, mailPass);
  }

  generateOTP(length = 6) {
    return crypto.randomInt(
      Math.pow(10, length - 1),
      Math.pow(10, length) - 1
    ).toString();
  }

  async sendOTP(email, length = 6, expiry = 120) {
    if (!email) throw new Error("missing_required");

    const otp = this.generateOTP(length);
    await this.redis.set(`otp:${email}`, otp, expiry); 
    await this.mailer.sendVerificationEmail(otp, email); 

    return true;
  }

  async verifyOTP(email, otp,req) {
    if (!email || !otp) throw new Error("missing_required");

    const storedOtp = await this.redis.get(`otp:${email}`);
    if (!storedOtp) throw new Error("otp_invalid");

    if (storedOtp !== otp) throw new Error("otp_invalid");

    await this.redis.del(`otp:${email}`); 

    if (req && req.audit) {
      req.audit.user = {email: email };
      req.audit.message =
        "OTP Verified Successfully | تم التحقق من الرقم السري لمرة واحدة بنجاح";
    }
    return true;
  }
}

module.exports = OtpService;
