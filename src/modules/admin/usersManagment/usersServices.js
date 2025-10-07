const {  Error } = require("sequelize");
const { User, Student, sequelize } = require("../../../models");
const ApiFeature = require("../../../Util/ApiFeatures");
const PaginatedResponse = require("../../../Util/PaginatedResponse");
const {updateIfChanged} = require("./helpers/updateHelper");

const { generateQr, checkEmailExists } = require("../../Auth/helpers/userHelper");
const { hashPassword } = require("../../Auth/helpers/passwordHelper");
const {
  validateName,
  validatePassword,
  validateNationalId,
} = require("../../Auth/validations/registerValidation");
const { formatStudentResponse, createStudentSuccessResponse } = require("./helpers/responseHelper");



///   Update status only method 
//msh h3ml create h3ml endpoint gdeda ala el register bs mbd'yan

const addAdmin = async (info) => {
  
  const {email , password } =info;

  return sequelize.transaction(async (t) => {
    await checkEmailExists(email, t)

    const hashedPassword = await hashPassword(password);

    const user = await User.create(
      { email, passwordHash: hashedPassword, role:"ADMIN" },
      { transaction: t }
    );

  
  return user;
})};

const getuUserById = async (id) => {
  const user = await User.findByPk(id);
  if (!user) throw new Error('id_not_found');
  
  const student = await Student.findOne({ where: { userId: id } });
  if (!student) throw new Error('student_not_found');
  
  return formatStudentResponse(student, user);
}

const getAllUsers = async (features) => {
    // const users = await User.findAll(features.options);
    const { count, rows: users } = await User.findAndCountAll(features.options);
    if (!users) throw new Error('not_found');
    
    return PaginatedResponse.fromApiFeature(
        features, 
        count, 
        users,  
        "Users fetched successfully"
    ); 
};

const getAllUsersByStatus = async (status,features) => {//shghala bs azbat el pagination lel response
  const { count, rows: users }= await Student.findAndCountAll(features.options,{where : {status}});
  if (!users) throw new Error('not_found');
  return PaginatedResponse.fromApiFeature(
      features, 
      count, 
      users,  
      "Users fetched successfully"
    ); 
};

const deleteUserById = async(id) => {
  const deletedCount = await User.destroy({ where : {userId : id }});
  if(deletedCount) return deletedCount;  
  else 
    throw new Error('id_not_found');
};

async function updateUser(userId, payload, idImage) {
  const {
    email,
    password,
    confirmPassword,
    name_ar,
    name_En,
    StudyLan,
    national_id,
    nationality,
    university,
    faculty,
    department,
    Mobile,
    training_type,
    type,
    status,
    role ,
  } = payload;


  if (name_ar) {
    validateName(name_ar);
  }

  // hash password if changed
  let hashedPassword = null;
  if (password) {
    hashedPassword = await hashPassword(password);
  }

  // generate QR again if name or national_id changed
  let qr = null;
  if (name_ar || national_id ){ //TODO: lw zwdto haga fel qr zwdoha hena
    qr = await generateQr(name_ar, national_id);
  }

  return sequelize.transaction(async (t) => {
    const user = await User.findByPk(userId, { transaction: t });
    if (!user) throw new Error("user_not_found");

    // Only update user fields that are provided
    const userUpdateData = {};
    if (email) userUpdateData.email = email;
    if (hashedPassword) userUpdateData.passwordHash = hashedPassword;
    if (role) userUpdateData.role = role;

    const { updated: userUpdated, model: updatedUser } = await updateIfChanged(
      user,
      userUpdateData,
      t
    );

    // update Student info
    const student = await Student.findOne({ where: { userId }, transaction: t });
    if (!student) throw new Error("student_not_found");

    // Get from payload or existing student
    const effectiveNationality = nationality || student.nationality;
    const effectiveNationalId = national_id || student.nationalId;
    validateNationalId(effectiveNationality, effectiveNationalId);//shghal✅

    // Only update student fields that are provided
    const studentUpdateData = {};
    if (type !== undefined) studentUpdateData.type = type;
    if (name_ar) studentUpdateData.fullName = name_ar;
    if (name_En) studentUpdateData.NameEn = name_En;
    if (StudyLan) studentUpdateData.StudyLan = StudyLan;
    if (Mobile) studentUpdateData.Mobile = Mobile;
    if (nationality) studentUpdateData.nationality = nationality;
    if (national_id) studentUpdateData.nationalId = national_id;
    if (university) studentUpdateData.university = university;
    if (faculty) studentUpdateData.college = faculty;
    if (department) studentUpdateData.department = department;
    if (idImage) studentUpdateData.nationalIdImage = idImage;
    if (training_type) studentUpdateData.courseType = training_type;
    if (status !== undefined) studentUpdateData.status = status;
    if (qr) studentUpdateData.profilePhoto = qr;

    const { updated: studentUpdated, model: updatedStudent } = await updateIfChanged(
      student,
      studentUpdateData,
      t
    );

    // --- Step 5: Response ---
    if (!userUpdated && !studentUpdated) {
      return createStudentSuccessResponse(student, user, "No changes detected");
    }

    return createStudentSuccessResponse(updatedStudent, updatedUser, "User updated successfully");
  });
}

const approveStudentByUserId = async (userId) => {
  const student = await Student.findOne({ where: { userId } });
  if (!student) throw new Error("student_not_found");

  student.status = "APPROVED";
  await student.save();

  return { message: "Student approved successfully", student };
};
module.exports = {
    getAllUsers,
    getAllUsersByStatus,
    deleteUserById,
    getuUserById,
    updateUser,
    addAdmin,
    approveStudentByUserId
}
