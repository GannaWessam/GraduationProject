const express = require("express");
const router = express.Router();
const {
  getAllSystemDataController,
  updateSystemDataController,
} = require("./systemDataController");
const { validateToken } = require("../../../middlewares/token");
const catchError = require("../../../middlewares/catchError");

// GET all system data with pagination
router.get("/system-data", validateToken,getAllSystemDataController);

// UPDATE a single row by ID
router.put("/system-data/:id", validateToken,catchError(updateSystemDataController));

module.exports = router;