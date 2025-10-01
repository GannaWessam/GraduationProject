const formatRegisterResponse = (user, student, price) => ({
  Price: price,
  id: user.userId,
  email: user.email,
  role: user.role,
//   profile: {
//     id: student.id,
//     name_ar: student.fullName,
//     national_id: student.nationalId,
//     university: student.university,
//     faculty: student.college,
//     department: student.department,
//     training_type: student.courseType,
//   },
});

const formatLoginResponse = (user, tok) => ({
  id: user.userId,
  email: user.email,
  role: user.role,
  // profile: user.Student,
  token: tok,

});

module.exports = { formatRegisterResponse, formatLoginResponse };
