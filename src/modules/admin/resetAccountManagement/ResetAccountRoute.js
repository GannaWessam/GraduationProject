const express = require("express");
const { resetAccountController } = require("./ResetAccountController");
const { validateToken } = require("../../../middlewares/token");

const router = express.Router();

router.put(
    "/resetAccount/:userId",
    validateToken,
    resetAccountController
  );

  module.exports = router;