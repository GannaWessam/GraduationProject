
const nationalIdRules = {
  Egypt: [(id) => id.length === 14 || "national id must be 14 chars"],
  Sudan: [
    (id) => id.length === 9 || "national id not valid",
    (id) => !/^[A-Za-z]/.test(id) || "national id not valid",
  ],
};


const runValidations = (rules, value) => {
  for (const rule of rules) {
    const result = rule(value);
    if (result !== true) throw new Error(result);
  }
};


const validateRequiredFields = (payload) => {
  const {
    email,
    password,
    confirmPassword,
    name_ar,
    name_En,
    national_id,
    training_type,
    type,
  } = payload;

  if (
    !email ||
    !password ||
    !confirmPassword ||
    !name_ar ||
    !name_En ||
    !national_id ||
    !training_type ||
    !type
  ) {
    throw new Error("missing_required_fields");
  }

  if (!["1", "2"].includes(type)) throw new Error("type not valid");
};

const validateName = (name_ar) => {
  if (name_ar.trim().length < 3) throw new Error("name not valid");
};

const validatePassword = (password, confirmPassword) => {
  const re =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]).{8,}$/;

  if (!password || password.trim().length < 8 || !re.test(password.trim())) {
    throw new Error("password not valid");
  }

  if (password !== confirmPassword) throw new Error("password mismatch");
};

const validateNationalId = (nationality, national_id) => {
  const rules = nationalIdRules[nationality];
  if (!rules) throw new Error(`No validation rule for nationality: ${nationality}`);
  runValidations(rules, national_id);
};

module.exports = {
  validateRequiredFields,
  validateName,
  validatePassword,
  validateNationalId,
};
