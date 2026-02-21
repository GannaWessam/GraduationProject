const errorMessages = {
  type_not_valid: { code: 400, msg: "Type not valid | النوع غير صالح" },
  name_not_valid: { code: 400, msg: "Name not valid | الاسم غير صالح" },
  password_not_valid: {
    code: 400,
    msg: "Password not valid | كلمة المرور غير صالحة",
  },
  password_mismatch: {
    code: 400,
    msg: "Passwords do not match | كلمات المرور غير متطابقة",
  },
  national_id_invalid: {
    code: 400,
    msg: "National ID not valid | الرقم القومي غير صالح",
  },
  nid_length: {
    code: 400,
    msg: "National ID must consist of 14 digits | يجب ان يكون الرقم القومى متكون من 14 رقم",
  },
  not_found_service: {
    code: 400,
    msg: "Service not found | الخدمة غير موجودة",
  },
  not_found: { code: 404, msg: "Not found | غير موجود" },
  id_not_found: { code: 404, msg: "ID not found | المعرف غير موجود" },
  missing_required: {
    code: 400,
    msg: "Missing required fields | حقول مطلوبة ناقصة",
  },
  email_exists: { code: 409, msg: "Email already exists | اسم المستخدم موجود" },
  national_id_exists: {
    code: 409,
    msg: "National ID already exists | الرقم القومي مسجل مسبقاً",
  },
  invalid_pass: {
    code: 401,
    msg: "Invalid login credentials | بيانات تسجيل الدخول غير صحيحة",
  },
  invalid_email: {
    code: 401,
    msg: "Invalid login credentials | بيانات تسجيل الدخول غير صحيحة",
  },
  otp_invalid: {
    code: 400,
    msg: "OTP invalid or expired | OTP غير صالح أو منتهي",
  },
  no_exams_found: { code: 404, msg: "No exams found | لا توجد امتحانات" },
  training_not_found: {
    code: 404,
    msg: "Training not found | التدريب غير موجود",
  },
  course_not_found: { code: 404, msg: "Course not found | الدورة غير موجودة" },
  trainer_not_found: { code: 404, msg: "Trainer not found | المدرب غير موجود" },
  no_trainings_found: {
    code: 404,
    msg: "No trainings found | لا توجد تدريبات",
  },
  "Event not found": {
    code: 404,
    msg: "Event not found | الفعالية غير موجودة",
  },
  "Failed to fetch event": {
    code: 404,
    msg: "Failed to fetch event | فشل في جلب الفعالية",
  },
  "Invalid event type": {
    code: 404,
    msg: "Invalid event type | نوع الفعالية غير صالح",
  },
  "Training not found for this event": {
    code: 404,
    msg: "Training not found for this event | التدريب غير موجود لهذه الفعالية",
  },
  "Exam not found for this event": {
    code: 404,
    msg: "Exam not found for this event | الامتحان غير موجود لهذه الفعالية",
  },
  no_reservations_found_for_training: {
    code: 404,
    msg: "No reservations found for training | لا توجد حجوزات للتدريب",
  },
  exam_not_found: { code: 404, msg: "Exam not found | الامتحان غير موجود" },
  training_not_found: {
    code: 404,
    msg: "Training not found | التدريب غير موجود",
  },
  event_not_found: { code: 404, msg: "Event not found | الفعالية غير موجودة" },
  event_closed: { code: 400, msg: "Event is closed | الفعالية مغلقة" },
  invalid_event_type: {
    code: 400,
    msg: "Invalid event type | نوع الفعالية غير صالح",
  },
  already_registered: {
    code: 409,
    msg: "User already registered for this event | المستخدم مسجل بالفعل لهذه الفعالية",
  },
  event_full: { code: 400, msg: "Event capacity is full | الفعالية ممتلئة" },
  course_id_is_null: {
    code: 400,
    msg: "Course ID is null, package must have at least one course | معرف الدورة فارغ، يجب أن تحتوي الحزمة على دورة واحدة على الأقل",
  },
  product_id_is_null: {
    code: 400,
    msg: "Product ID is null, package must belong to at least one product | معرف المنتج فارغ، يجب أن تنتمي الحزمة إلى منتج واحد على الأقل",
  },
  package_not_found: {
    code: 404,
    msg: "Package not found | الحزمة غير موجودة",
  },
  "packageId or courseId is required": {
    code: 400,
    msg: "You must send either packageId or courseId | يجب إرسال معرف الحزمة أو معرف الدورة",
  },
  "there is alraedy training with the same name": {
    code: 400,
    msg: "There is already a training with the same name | يوجد بالفعل تدريب بنفس الاسم",
  },
  "there is alraedy exam with the same name": {
    code: 400,
    msg: "There is already an exam with the same name | يوجد بالفعل امتحان بنفس الاسم",
  },
  "you can't reserve a closed training": {
    code: 400,
    msg: "You can't reserve a closed training | لا يمكنك حجز تدريب مغلق",
  },
  "Can not register for this event capacity have been reached": {
    code: 400,
    msg: "Cannot register for this event, capacity has been reached | لا يمكن التسجيل لهذه الفعالية، تم الوصول للقدرة الاستيعابية",
  },
  "Failed to close event": {
    code: 400,
    msg: "Failed to close event | فشل في إغلاق الفعالية",
  },
  "courses array is required when creating package exams": {
    code: 400,
    msg: "Courses array is required when creating package exams | مصفوفة الدورات مطلوبة عند إنشاء امتحانات الحزمة",
  },
  "there is already exam with the same name": {
    code: 400,
    msg: "There is already an exam with the same name | يوجد بالفعل امتحان بنفس الاسم",
  },
  event_not_found_or_creation_failed: {
    code: 404,
    msg: "Event not found or creation failed | الفعالية غير موجودة أو فشل الإنشاء",
  },
  no_upcoming_exams_found: {
    code: 404,
    msg: "No upcoming exams found | لا توجد امتحانات قادمة",
  },
  no_reservations_found: {
    code: 404,
    msg: "No reservations found | لا توجد حجوزات",
  },
  course_not_found_for_event: {
    code: 404,
    msg: "Course not found for event | الدورة غير موجودة للفعالية",
  },
  "packageName and size are required": {
    code: 400,
    msg: "Package name and size are required | اسم الحزمة والحجم مطلوبان",
  },
  "Please enter existing and valid product IDs.": {
    code: 400,
    msg: "Please enter existing and valid product IDs | يرجى إدخال معرفات منتجات موجودة وصحيحة",
  },
  "Please enter existing and valid course IDs.": {
    code: 400,
    msg: "Please enter existing and valid course IDs | يرجى إدخال معرفات دورات موجودة وصحيحة",
  },
  "Training not found": {
    code: 404,
    msg: "Training not found | التدريب غير موجود",
  },
  "Session time overlaps with another session in the same training or event": {
    code: 400,
    msg: "Session time overlaps with another session in the same training or event | وقت الجلسة يتداخل مع جلسة أخرى في نفس التدريب أو الفعالية",
  },
  session_not_found: {
    code: 404,
    msg: "Session not found | الجلسة غير موجودة",
  },
  sessions_not_found: {
    code: 404,
    msg: "Sessions not found | الجلسات غير موجودة",
  },
  "startDate and endDate are required": {
    code: 400,
    msg: "Start date and end date are required | تاريخ البداية وتاريخ النهاية مطلوبان",
  },
  student_not_found: { code: 404, msg: "Student not found | الطالب غير موجود" },
  user_not_found: { code: 404, msg: "User not found | المستخدم غير موجود" },
  nationalId_required: {
    code: 400,
    msg: "National ID is required | الرقم القومي مطلوب",
  },
  service_not_found: {
    code: 404,
    msg: "Service not found | الخدمة غير موجودة",
  },
  this_type_not_allowed_for_this_product: {
    code: 400,
    msg: "This type is not allowed for this product | هذا النوع غير مسموح لهذا المنتج",
  },
  "Product not found": {
    code: 404,
    msg: "Product not found | المنتج غير موجود",
  },
  "This user type is not allowed for the selected product": {
    code: 400,
    msg: "This user type is not allowed for the selected product | نوع المستخدم هذا غير مسموح للمنتج المحدد",
  },
  missing_required_fields: {
    code: 400,
    msg: "Missing required fields | حقول مطلوبة ناقصة",
  },
  "type not valid": { code: 400, msg: "Type not valid | النوع غير صالح" },
  "name not valid": { code: 400, msg: "Name not valid | الاسم غير صالح" },
  "password not valid": {
    code: 400,
    msg: "Password not valid | كلمة المرور غير صالحة",
  },
  "password mismatch": {
    code: 400,
    msg: "Passwords do not match | كلمات المرور غير متطابقة",
  },
  no_records: { code: 404, msg: "No records found | لا توجد سجلات" },
  Supervisor_not_found: {
    code: 404,
    msg: "Supervisor not found | المشرف غير موجود",
  },
  "Can not register for this event": {
    code: 400,
    msg: "Cannot register for this event | لا يمكن التسجيل لهذه الفعالية",
  },
  "No exams found for this event or package.": {
    code: 404,
    msg: "No exams found for this event or package | لا توجد امتحانات لهذه الفعالية أو الحزمة",
  },
  "Training event not found": {
    code: 404,
    msg: "Training event not found | فعالية التدريب غير موجودة",
  },
  "No training sessions found for this event": {
    code: 404,
    msg: "No training sessions found for this event | لا توجد جلسات تدريبية لهذه الفعالية",
  },
  "Student not found": {
    code: 404,
    msg: "Student not found | الطالب غير موجود",
  },
  // Generate Student Data Excel (download sheet)
  eventId_required: {
    code: 400,
    msg: "eventId is required in the URL (e.g. /downloadSheet/:eventId) | معرف الفعالية مطلوب",
  },
  invalid_event_id_format: {
    code: 400,
    msg: "eventId must be a valid UUID | معرف الفعالية يجب أن يكون UUID صالح",
  },
  no_reservations_for_event: {
    code: 404,
    msg: "No reservations found for this event | لا توجد حجوزات لهذه الفعالية",
  },
  event_not_found_excel: {
    code: 404,
    msg: "Event not found | الفعالية غير موجودة",
  },
  excel_generation_failed: {
    code: 500,
    msg: "Failed to generate Excel file | فشل في إنشاء ملف Excel",
  },
  error_in_getting_student_data: {
    code: 500,
    msg: "Error in getting student data | خطأ في الحصول على بيانات الطلاب",
  },

  "Currency not found": {
    code: 404,
    msg: "Currency not found | العملة غير موجودة",
  },
  "parsedData must be a non-null array": {
    code: 400,
    msg: "Parsed data must be a non-null array | بيانات التحليل يجب أن تكون مصفوفة غير فارغة",
  },
  "eventId is required": {
    code: 400,
    msg: "Event ID is required | معرف الفعالية مطلوب",
  },
  "Excel buffer is required": {
    code: 400,
    msg: "Excel buffer is required | ملف Excel مطلوب",
  },
  "Failed to parse Excel file from buffer/request": {
    code: 400,
    msg: "Failed to parse Excel file | فشل في قراءة ملف Excel",
  },
  "No worksheet found in Excel file": {
    code: 400,
    msg: "No worksheet found in Excel file | لم يتم العثور على ورقة عمل في الملف",
  },
  "Header row is missing in Excel file": {
    code: 400,
    msg: "Header row is missing in Excel file | صف العناوين مفقود في ملف Excel",
  },
  "No files uploaded": {
    code: 400,
    msg: "No files uploaded | لم يتم رفع أي ملفات",
  },
  "No materials found for this session": {
    code: 404,
    msg: "No materials found for this session | لا توجد مواد لهذه الجلسة",
  },
  "Failed to fetch session materials": {
    code: 500,
    msg: "Failed to fetch session materials | فشل في جلب مواد الجلسة",
  },
  "Failed to fetch Attendance for this session": {
    code: 500,
    msg: "Failed to fetch attendance for this session | فشل في جلب الحضور لهذه الجلسة",
  },
  "Conversation not found": {
    code: 404,
    msg: "Conversation not found | المحادثة غير موجودة",
  },
  "At least 2 users are required": {
    code: 400,
    msg: "At least 2 users are required | مطلوب مستخدمان على الأقل",
  },
  "Invalid number of users": {
    code: 400,
    msg: "Invalid number of users | عدد المستخدمين غير صالح",
  },
  "Invalid time format, expected HH:mm or HH:mm:ss": {
    code: 400,
    msg: "Invalid time format, expected HH:mm or HH:mm:ss | تنسيق الوقت غير صالح، المتوقع HH:mm أو HH:mm:ss",
  },
  "Session start time must be before end time": {
    code: 400,
    msg: "Session start time must be before end time | وقت بداية الجلسة يجب أن يكون قبل وقت النهاية",
  },
  "You cannot reserve this event again until all your previous exam results are 'fail'.":
    {
      code: 400,
      msg: "You cannot reserve this event again until all your previous exam results are fail | لا يمكنك حجز هذه الفعالية مرة أخرى حتى تكون جميع نتائج امتحاناتك السابقة راسب",
    },
  "You cannot reserve this training again until previous sessions are finished.":
    {
      code: 400,
      msg: "You cannot reserve this training again until previous sessions are finished | لا يمكنك حجز هذا التدريب مرة أخرى حتى تنتهي الجلسات السابقة",
    },
  "Cannot create conversation with same users more than once": {
    code: 400,
    msg: "Cannot create conversation with same users more than once | لا يمكن إنشاء محادثة بين نفس المستخدمين أكثر من مرة",
  },
  "username is required for password generation": {
    code: 400,
    msg: "Username is required for password generation | اسم المستخدم مطلوب لتوليد كلمة المرور",
  },
  "eventName and counter are required for username generation": {
    code: 400,
    msg: "Event name and counter are required for username generation | اسم الفعالية والعداد مطلوبان لتوليد اسم المستخدم",
  },
  "Failed to insert courses": {
    code: 500,
    msg: "Failed to insert courses | فشل في إدراج الكورسات",
  },
  missing_course_id: {
    code: 400,
    msg: "Course ID is missing | معرف الكورس مفقود",
  },
  no_data_to_update: {
    code: 400,
    msg: "No data to update | لا توجد بيانات للتحديث",
  },
  supervisor_not_found: {
    code: 404,
    msg: "Supervisor not found | المشرف غير موجود",
  },

  course_not_found_by_title: {
    code: 404,
    msg: "No course found with the given title | لم يتم العثور على كورس بالعنوان المحدد",
  },
  failed_to_update_student_course: {
    code: 500,
    msg: "Failed to update student course | فشل في تحديث كورس الطالب",
  },
  student_not_found_for_national_id: {
    code: 404,
    msg: "Student not found for the given national ID | الطالب غير موجود للرقم القومي المحدد",
  },
  no_exam_found_for_course_and_student: {
    code: 404,
    msg: "No exam found for this course and student | لم يتم العثور على امتحان لهذا الكورس والطالب",
  },
  event_excel_courses_mismatch: {
    code: 400,
    msg: "Event has more courses than in the Excel for this student | الفعالية تحتوي على كورسات أكثر من الموجودة في ملف Excel لهذا الطالب",
  },
  reservation_overlaps_with_event: {
    code: 400,
    msg: "You already have a reservation that overlaps with this event | لديك حجز يتداخل مع هذه الفعالية",
  },
  failed_to_fetch_events: {
    code: 500,
    msg: "Failed to fetch events | فشل في جلب الفعاليات",
  },
  invalid_file_type: {
    code: 400,
    msg: "Invalid file type | نوع الملف غير صالح",
  },
  required_column_not_found: {
    code: 400,
    msg: "Required column not found in Excel file | العمود المطلوب غير موجود في ملف Excel",
  },
  session_date_before_event_start: {
    code: 400,
    msg: "Session date cannot be before event start date | تاريخ الجلسة لا يمكن أن يكون قبل تاريخ بداية الفعالية",
  },
  session_date_after_event_end: {
    code: 400,
    msg: "Session date cannot be after event end date | تاريخ الجلسة لا يمكن أن يكون بعد تاريخ نهاية الفعالية",
  },
  missing_courses_from_package: {
    code: 400,
    msg: "Missing courses from package | كورسات ناقصة من الحزمة",
  },
  extra_courses_not_in_package: {
    code: 400,
    msg: "Extra courses not in package | كورسات إضافية غير موجودة في الحزمة",
  },
  validation_failed: {
    code: 400,
    msg: "Validation failed | فشل التحقق من صحة البيانات",
  },
  failed_to_fetch_users: {
    code: 500,
    msg: "Failed to fetch users | فشل في جلب المستخدمين",
  },
  "Failed to fetch students for this training": {
    code: 500,
    msg: "Failed to fetch students for this training | فشل في جلب الطلاب لهذا التدريب",
  },
  "Failed to fetch students for this exam": {
    code: 500,
    msg: "Failed to fetch students for this exam | فشل في جلب الطلاب لهذا الامتحان",
  },
  permissions_array_required: {
    code: 400,
    msg: "Permissions array is required | مصفوفة الصلاحيات مطلوبة",
  },
  one_or_more_permissions_not_found: {
    code: 404,
    msg: "One or more permissions not found | صلاحية أو أكثر غير موجودة",
  },
  permission_exists: {
    code: 409,
    msg: "Permission already exists | الصلاحية موجودة مسبقاً",
  },
  invalid_permissions_array: {
    code: 400,
    msg: "Invalid permissions array | مصفوفة الصلاحيات غير صالحة",
  },
  container_exists: {
    code: 409,
    msg: "Container already exists | الحاوية موجودة مسبقاً",
  },
  profile_exists: {
    code: 409,
    msg: "Profile already exists | البروفايل موجود مسبقاً",
  },

  /** Fallback for any error not in this map (centralized error handler uses this for audit) */
  internal_server_error: {
    code: 500,
    msg: "Internal server error | خطأ داخلي في الخادم",
  },
  "Failed login attempt": {
    code: 401,
    msg: "Failed login attempt | محاولة تسجيل دخول فاشلة",
  },
};

function getErrorPayload(errorKey) {
  const entry = errorMessages[errorKey];
  if (entry) return entry;
  return errorMessages["internal_server_error"];
}

module.exports = { errorMessages, getErrorPayload };
