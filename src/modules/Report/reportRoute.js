// const express = require("express");
// const router = express.Router();
// const { arabicReport } = require("./reportController");

// router.get("/arabic-report", arabicReport);

// module.exports = router;


// controllers/ReportController.js


// routes/reportRoutes.js
const express = require("express");
const router = express.Router();
const ReportController = require("./reportController");
const catchError = require("../../middlewares/catchError");
const { validateToken } = require("../../middlewares/token");
const checkPermission = require("../../middlewares/checkPermission");

router.get(
  "/arabic-report",
  validateToken,
  // checkPermission("getReports"),
  catchError(ReportController.getArabicReport)
);

module.exports = router;
