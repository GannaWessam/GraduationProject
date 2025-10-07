const express = require("express");
const router = express.Router();
const reportController = require("./reportController");

router.get("/students", reportController.getStudentRegistrationReport);

module.exports = router;
