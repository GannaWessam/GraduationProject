const authService = require('./AuthService');

async function register(req, res) {
  try {
    const result = await authService.registerUser(req.body);
    return res.status(201).json({ success: true, user: result });
  } catch (err) {
    let msg = err.message;
    if (msg === 'name not valied') return res.status(400).json({ success: false, error: 'name not valied' });
    if (msg === 'password not valied') return res.status(400).json({ success: false, error: 'password not valied' });
    if (msg === 'national id not valid') return res.status(400).json({ success: false, error: 'national id not valid' });
    if (msg === 'not found service') return res.status(400).json({ success: false, error: 'not found service' });
    if (msg === 'missing_required_fields') return res.status(400).json({ success: false, error: 'حقول مطلوبة ناقصة' });
    if (msg === 'password mismatch') return res.status(400).json({ success: false, error: 'كلمات المرور غير متطابقة' });
    if (msg === 'national id must be 14 chars') return res.status(400).json({ success: false, error: 'الرقم القومي لازم 14 رقم' });
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
    return res.json({ success: true, user: result });
  } catch (err) {
    if (err.message === 'invalid_pass') {
      return res.status(401).json({ success: false, error: 'بيانات تسجيل الدخول غير صحيحة' });
    }
    if (err.message === 'invalid_email') {
      return res.status(401).json({ success: false, error: 'بيانات تسجيل الدخول غير صحيحة' });
    }
    console.error(err);
    return res.status(500).json({ success: false, error: 'خطأ في السيرفر' });
  }
}

module.exports = { register, login };