// services/OtpService.js
const crypto = require('crypto');
const RedisService = require('./Redies_Connection');
const MailService = require('./Mail_Service');

class OtpService {
  constructor(mailUser, mailPass) {
    this.redis = new RedisService();
    this.redis.connect();
    this.mailer = new MailService(mailUser, mailPass);
  }

  generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
  }

  async sendOTP(email, length = 6, expiry = 120) {
    try {
      const otp = this.generateOTP(length);
      await this.redis.set(`otp:${email}`, otp, expiry); // store in Redis with expiry (seconds)
      await this.mailer.sendVerificationEmail(otp, email); // send email with OTP
    } catch (error) {
      throw new Error(error);
    }
  }

  async verifyOTP(email, otp) {
    const storedOtp = await this.redis.get(`otp:${email}`);
    if (!storedOtp) return false;
    const isValid = storedOtp === otp;
    if (isValid) await this.redis.del(`otp:${email}`);
    return isValid;
  }
}

module.exports = OtpService;
