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
  const reqIp =
    req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const userData = req.body;
  try {
        const result = await registerUser(userData, req.file?.filename);

    await logger.info({
      ip: reqIp,
      user: {
        _id: result.data.user.userId,
        email: result.data.user.email,
        name: userData.name_ar,
      },
      type: "modification",
      message: "User registered successfully",
    });

    return res.status(201).json(ApiResponse.created(result));
  } catch (error) {
    await logger.error({
      ip: reqIp,
      user: { email: userData.email },
      type: "modification",
      message: `User registration failed: ${error.message}`,
    });
    return next(error);
  }
};

exports.login = async (req, res, next) => {
    const reqIp = req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const { email } = req.body;
  try {
    const { email, password, rememberMe = false } = req.body;
    const result = await loginUser(email, password, rememberMe);
     await logger.info({
      ip: reqIp,
      user: { _id: result.id, email },
      type: "read",
      message: "User logged in successfully",
    });
    return res.status(200).json(ApiResponse.success(result));
  } catch (error) {
    await logger.error({
      ip: reqIp,
      user: { email },
      type: "read",
      message: `Login failed: ${error.message}`,
    });

    return next(error);
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;
    const result = await resetPassword(email, newPassword);
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
  await OTP.verifyOTP(req.body.email, req.body.otp);
  return res
    .status(200)
    .json(ApiResponse.success("تم التأكد من الايميل بنجاح"));
};

exports.getUser = async (req, res, next) => {
  try {
    const result = await getuser(req.query.email);
    return res.status(201).json(ApiResponse.created(result));
  } catch (error) {
    return next(error);
  }
};

exports.getUserFees = async (req, res, next) => {
  try {
    const result = await getuserfees(req.query.userId);
    return res.status(201).json(ApiResponse.created(result));
  } catch (error) {
    return next(error);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await verifyEmail(email);

    return res
      .status(200)
      .json(ApiResponse.success(result, "founded successfully"));
  } catch (error) {
    return next(error);
  }
};
