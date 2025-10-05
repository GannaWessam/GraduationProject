const { registerUser, loginUser, resetPassword , verifyEmail ,getuser ,getuserfees } = require("./AuthService");
const ApiResponse = require("../../Util/ApiResponse.js");
const OtpService = require("../../Services/OtpService.js");

const OTP = new OtpService(process.env.GMAIL_USER, process.env.GMAIL_PASS);

exports.register = async (req, res, next) => {
  try {
    const result = await registerUser(req.body, req.file?.filename);
    return res.status(201).json(ApiResponse.created(result));
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    return res.status(200).json(ApiResponse.success(result));
  } catch (err) {
    next(err);
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;
    const result = await resetPassword(email, newPassword);
    return res
      .status(200)
      .json(ApiResponse.success(result, "Password updated successfully"));
  } catch (err) {
    next(err);
  }
};

exports.sendOtp = async (req, res) => {
  await OTP.sendOTP(req.body.email, 6, 120);
  return res
    .status(200)
    .json(ApiResponse.success("تم ارسال الرقم السرى الى الايميل المذكور"));
};

exports.verifyOTP = async (req, res) => {
  await OTP.verifyOTP(req.body.email, req.body.otp);
  return res
    .status(200)
    .json(ApiResponse.success("تم التأكد من الايميل بنجاح"));
};

exports.getUser = async (req, res, next) => {
  try {
    const result = await getuser(req.query.email);
    return res.status(201).json(ApiResponse.created(result));
  } catch (err) {
    next(err);
  }
};

exports.getUserFees = async (req, res, next) => {
  try {
    const result = await getuserfees(req.query.userId);
    return res.status(201).json(ApiResponse.created(result));
  } catch (err) {
    next(err);
  }
};

exports.verifyEmail = async(req, res , next) => {
  try {
    const { email } = req.body;
    const result = await verifyEmail(email);
    
    return res
      .status(200)
      .json(ApiResponse.success(result, "founded successfully"));

  } catch (err) {
    next(err);
  }
}