/** 
 * Functions:
 * - formatStudentResponse: Formats a single student with user data
 * - formatStudentsResponse: Formats multiple students with user data
 * - createStudentSuccessResponse: Creates a success response with student data - astkhdmha fel controller
 */

// Helper function to format student response with user data
const formatStudentResponse = (student, user) => {
  return {
    id: student.id,
    userId: student.userId,
    email: user.email,
    role: user.role,
    fullName: student.fullName,
    NameEn: student.NameEn,
    StudyLan: student.StudyLan,
    Mobile: student.Mobile,
    nationality: student.nationality,
    nationalId: student.nationalId,
    university: student.university,
    college: student.college,
    department: student.department,
    nationalIdImage: student.nationalIdImage,
    courseType: student.courseType,
    status: student.status,
    profilePhoto: student.profilePhoto,
    type: student.type,
    createdAt: student.createdAt,
    updatedAt: student.updatedAt
  };
};

// Helper function to format multiple students response
const formatStudentsResponse = (students, users) => {
  return students.map((student, index) => {
    const user = users.find(u => u.userId === student.userId) || users[index];
    return formatStudentResponse(student, user);
  });
};

// Helper function to create success response with student data
const createStudentSuccessResponse = (student, user, message = "Operation successful") => {
  return {
    message,
    student: formatStudentResponse(student, user)
  };
};

module.exports = {
  formatStudentResponse,
  formatStudentsResponse,
  createStudentSuccessResponse
};
