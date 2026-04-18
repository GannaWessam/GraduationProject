const bcrypt = require("bcrypt");

const hashPassword = async (password) => bcrypt.hash(password.trim(), 4);

const comparePassword = async (password, hash) => {
  const valid = await bcrypt.compare(password, hash);
  if (!valid) throw new Error("invalid_pass");
};

module.exports = { hashPassword, comparePassword };