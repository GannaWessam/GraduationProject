const jwt = require("jsonwebtoken");
require("dotenv").config();
const ApiResponse = require("../Util/ApiResponse");

function generateToken(email, name, id, role ) {
  const tokenData = { email, name, id, role };
  const token = jwt.sign(tokenData, process.env.SecretKey, { expiresIn: "30d" });
  return token;
}

function validateToken(req, res, next) {
  const header = req.headers["authorization"];
  if (!header)
    return res
      .status(400)
      .json(
        new ApiResponse(false, "there is no auth header", null, [
          "missing_header",
        ])
      );

  const token = header.split(" ")[1];
  if (!token)
    return res
      .status(401)
      .json(
        new ApiResponse(false, "No token provided", null, ["missing_token"])
      );

  jwt.verify(token, process.env.SecretKey, (err, tokenData) => {
    if (err) {
      return res
        .status(403)
        .json(new ApiResponse(false, "Invalid token", null, ["invalid_token"]));
    }

    req.userData = tokenData;
    next();
  });
}

module.exports = { generateToken, validateToken };
