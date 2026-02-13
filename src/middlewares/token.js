const jwt = require("jsonwebtoken");
require("dotenv").config();
const ApiResponse = require("../Util/ApiResponse");
const { User } = require("../models");

const DEFAULT_TOKEN_EXPIRY = process.env.JWT_EXPIRY || "1d";
const REMEMBER_ME_TOKEN_EXPIRY =
  process.env.JWT_REMEMBER_ME_EXPIRY || DEFAULT_TOKEN_EXPIRY;

function generateToken(
  email,
  name,
  id,
  role,
  NameEn,
  productId,
  status,
  rememberMe = false ,
  tokenVersion,
  permissions = []
) {
  const tokenData = { email, name, id, role, NameEn, productId, status,tokenVersion ,permissions};
  const expiresIn = rememberMe ? REMEMBER_ME_TOKEN_EXPIRY : DEFAULT_TOKEN_EXPIRY;
  return jwt.sign(tokenData, process.env.SecretKey, { expiresIn });
}

async function  validateToken (req, res, next) {
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

      try {
        const tokenData = jwt.verify(token, process.env.SecretKey);
        const user = await User.findByPk(tokenData.id);
        
        if (tokenData.tokenVersion !== user.tokenVersion) {
          return res.status(409).json(
            new ApiResponse(false, "Session expired", null, [
              "token_version_mismatch",
            ])
          );
        }
        req.userData = tokenData;
        next();
      } catch (err) {
        return res.status(403).json(
          new ApiResponse(false, "Invalid token", null, ["invalid_token"])
        );
      }
}

module.exports = { generateToken, validateToken };
