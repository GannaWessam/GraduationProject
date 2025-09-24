const OtpService = require('../Services/OtpService');
const OTP=new OtpService(process.env.GMAIL_USER, process.env.GMAIL_PASS);
const authService = require('./AuthService');

async function register(req, res) {
  try {
    const result = await authService.registerUser(req.body);
    return res.status(201).json({ success: true, user: result });
  } catch (err) {
    let msg = err.message;
    if (msg === 'type not valied') return res.status(400).json({ success: false, error: 'type not vaild' });
    if (msg === 'name not valied') return res.status(400).json({ success: false, error: 'name not vaild' });
    if (msg === 'password not valied') return res.status(400).json({ success: false, error: 'password not vaild' });
    if (msg === 'national id not valid') return res.status(400).json({ success: false, error: 'national id not valid' });
    if (msg === 'not found service') return res.status(400).json({ success: false, error: 'not found service' });
    if (msg === 'missing_required_fields') return res.status(400).json({ success: false, error: 'حقول مطلوبة ناقصة' });
    if (msg === 'password mismatch') return res.status(400).json({ success: false, error: 'كلمات المرور غير متطابقة' });
    if (msg === 'national id must be 14 chars') return res.status(400).json({ success: false, error: 'يجب ان يكون الرقم القومى متكون من 14 رقم' });
    if (msg === 'email_exists') return res.status(409).json({ success: false, error: 'اسم المستخدم موجود' });
    if (msg === 'national_id_exists') return res.status(409).json({ success: false, error: 'الرقم القومي مسجل مسبقاً' });

    console.error(err);
    return res.status(500).json({ success: false, error: 'خطأ في السيرفر' });
  }
}

async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ success: false, error: 'اسم المستخدم وكلمة المرور مطلوبين' });

    const result = await authService.loginUser(username, password);
    console.log(result);
    return res.json({ success: true, user: result });
  } catch (err) {
    if (err.message === 'invalid_pass') {
      return res.status(401).json({ success: false, error: '1بيانات تسجيل الدخول غير صحيحة' });
    }
    if (err.message === 'invalid_email') {
      return res.status(401).json({ success: false, error: '2بيانات تسجيل الدخول غير صحيحة' });
    }
    console.error(err);
    return res.status(500).json({ success: false, error: 'خطأ في السيرفر' });
  }
}

async function updatePassword(req, res) {
  try {
    const {email , newPassword } = req.body;

    const result = await authService.resetPassword(email, newPassword);

    return res.status(201).json({ success: true, user: result });

  } catch (error) {
    let msg = error.message;
    if (msg === 'invalid_email') return res.status(400).json({ success: false, error: 'الايميل غير صحيح' });
    if (msg === 'password not valied') return res.status(400).json({ success: false, error: 'كلمة السر غير مطابقة للشروط' });

    console.error(error);
    return res.status(500).json({ success: false, error: 'خطأ في السيرفر' });
  }
};

const sendOtp=async(req, res) => {
  try {
    const {email} = req.body;
    await OTP.sendOTP(email,6,120);
    res.status(200).json({ message: 'تم ارسال الرقم السرى الى الايميل المذكور' })
  } catch (error) {
    res.status(500).json({ success: false,error:'خطأ في السيرفر'})
  }
}

const verifyOTP=async(req, res) => {
  const { email, otp } = req.body;
  const isValid = await OTP.verifyOTP(email, otp);
  if (isValid) return res.json({success:true, message: 'تم التأكد من الايميل بنجاح' });
  res.status(500).json({ success: false,error:'خطأ في السيرفر'})
}

module.exports = { register, login ,updatePassword ,sendOtp,verifyOTP};