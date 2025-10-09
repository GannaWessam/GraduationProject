const { generateQr } = require("../../../Auth/helpers/userHelper");
const { hashPassword } = require("../../../Auth/helpers/passwordHelper");
async function updateIfChanged(modelInstance, data, transaction) {
  if (!data || Object.keys(data).length === 0)
    return { updated: false, model: modelInstance };

  const hasChanges = Object.entries(data).some(
    ([key, value]) => modelInstance[key] !== value
  );

  if (!hasChanges) return { updated: false, model: modelInstance };

  const updatedModel = await modelInstance.update(data, { transaction });
  return { updated: true, model: updatedModel };
}

function buildUserUpdateData({ email, hashedPassword, role }) {
  return filterEmpty({
    email,
    passwordHash: hashedPassword,
    role,
  });
}

function buildStudentUpdateData(payload, idImage, qr) {
  const {
    type,
    name_ar,
    name_En,
    StudyLan,
    Mobile,
    nationality,
    national_id,
    university,
    faculty,
    department,
    training_type,
    status,
  } = payload;

  return filterEmpty({
    type,
    fullName: name_ar,
    NameEn: name_En,
    StudyLan,
    Mobile,
    nationality,
    nationalId: national_id,
    university,
    college: faculty,
    department,
    nationalIdImage: idImage,
    courseType: training_type,
    status,
    profilePhoto: qr,
  });
}

async function preparePassword(password) {
  return password ? await hashPassword(password) : null;
}

async function prepareQr(name_ar, national_id) {
  return (name_ar || national_id)
    ? await generateQr(name_ar || undefined, national_id || undefined)
    : null;
}

function filterEmpty(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v != null));
}

module.exports = {
  updateIfChanged,
  buildUserUpdateData,
  buildStudentUpdateData,
  preparePassword,
  prepareQr,
};
