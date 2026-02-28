const express = require("express");
const router = express.Router();
const {
  getAllSystemDataController,
  updateSystemDataController,
} = require("./systemDataController");

// GET all system data with pagination
router.get("/system-data", getAllSystemDataController);

// UPDATE a single row by ID
router.put("/system-data/:id", updateSystemDataController);

module.exports = router;