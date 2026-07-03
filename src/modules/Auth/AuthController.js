const {
  registerUser,
  loginUser,
  resetPassword,
  verifyEmail,
  getuser,
  getuserfees,
} = require("./AuthService");
const ApiResponse = require("../../Util/ApiResponse.js");
const OtpService = require("../../Services/OtpService.js");
const logger = require("../../Util/logger.js");
const OTP = new OtpService(process.env.GMAIL_USER, process.env.GMAIL_PASS);

exports.register = async (req, res, next) => {
  try {
    const result = await registerUser(
      req.body,
      {
        front: req.files?.nationalIdImage?.[0]?.filename,
        back: req.files?.nationalIdBack?.[0]?.filename,
      },
      req
    );

    return res.status(201).json(ApiResponse.created(result));
  } catch (error) {
    return next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password, rememberMe = false } = req.body;
    const result = await loginUser(email, password, rememberMe,req);

    return res.status(200).json(ApiResponse.success(result));
  } catch (error) {
    return next(error);
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;
    const result = await resetPassword(email, newPassword, req);
    return res
      .status(200)
      .json(ApiResponse.success(result, "Password updated successfully"));
  } catch (error) {
    return next(error);
  }
};

exports.sendOtp = async (req, res) => {
  await OTP.sendOTP(req.body.email, 6, 120); //otp didgits + expiration
  return res
    .status(200)
    .json(ApiResponse.success("تم ارسال الرقم السرى الى الايميل المذكور"));
};

exports.verifyOTP = async (req, res) => {
  await OTP.verifyOTP(req.body.email, req.body.otp,req);
  return res
    .status(200)
    .json(ApiResponse.success("تم التأكد من الايميل بنجاح"));
};

exports.getUser = async (req, res, next) => {
  try {
    const result = await getuser(req.query.email, req);
    return res.status(201).json(ApiResponse.created(result));
  } catch (error) {
    return next(error);
  }
};

exports.getUserFees = async (req, res, next) => {
  try {
    const result = await getuserfees(req.query.userId, req);
    return res.status(201).json(ApiResponse.created(result));
  } catch (error) {
    return next(error);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await verifyEmail(email, req);

    return res
      .status(200)
      .json(ApiResponse.success(result, "founded successfully"));
  } catch (error) {
    return next(error);
  }
};
