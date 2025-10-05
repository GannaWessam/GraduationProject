const errorMessages = {
  "type_not_valid":      { code: 400, msg: "type not valid" },
  "name_not_valid":      { code: 400, msg: "name not valid" },
  "password_not_valid":  { code: 400, msg: "password not valid" },
  "password_mismatch":   { code: 400, msg: "كلمات المرور غير متطابقة" },
  "national_id_invalid": { code: 400, msg: "national id not valid" },
  "nid_length":          { code: 400, msg: "يجب ان يكون الرقم القومى متكون من 14 رقم" },
  "not_found_service":   { code: 400, msg: "not found service" },
  "not_found":           { code: 404, msg: "not found" },
  "id_not_found":        { code: 404, msg: "id_not_found" },
  "missing_required":    { code: 400, msg: "حقول مطلوبة ناقصة" },
  "email_exists":        { code: 409, msg: "اسم المستخدم موجود" },
  "national_id_exists":  { code: 409, msg: "الرقم القومي مسجل مسبقاً" },
  "invalid_pass":        { code: 401, msg: "بيانات تسجيل الدخول غير صحيحة" },
  "invalid_email":       { code: 401, msg: "بيانات تسجيل الدخول غير صحيحة" },
  "otp_invalid":         { code: 400, msg: "OTP غير صالح أو منتهي" },
};

module.exports = { errorMessages };
