const jwt = require("jsonwebtoken");


const SECRET = process.env.SESSION_SECRET;

exports.generateSessionToken = (sessionId,sessionName ,instructorId) => {
  return jwt.sign({ sessionId,sessionName ,instructorId }, SECRET, { expiresIn: "3m" });
};

exports.verifySessionToken = (token) => jwt.verify(token, SECRET);