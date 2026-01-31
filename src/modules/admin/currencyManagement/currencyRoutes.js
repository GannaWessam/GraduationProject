const express = require("express");
const router = express.Router();

const currencyController = require("./currencyController");
const catchError = require("../../../middlewares/catchError");
const { validateToken } = require("../../../middlewares/token");

// ================= Currency Routes =================

router.post("/", validateToken, catchError(currencyController.create));
router.get("/", validateToken, catchError(currencyController.getAll));
router.get("/:id", validateToken, catchError(currencyController.getById));
router.put("/:id", validateToken, catchError(currencyController.update));
router.delete("/:id", validateToken, catchError(currencyController.delete));

module.exports = router;