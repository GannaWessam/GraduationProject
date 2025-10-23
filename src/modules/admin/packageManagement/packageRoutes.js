const express = require("express");
const router = express.Router();
const packageController = require("./packageController");
const catchError = require("../../../middlewares/catchError");
const { validateToken } = require("../../../middlewares/token");


router.post("/",validateToken, catchError(packageController.create));
router.get("/",validateToken, catchError(packageController.getAll));
router.get("/:id",validateToken, catchError(packageController.getById));
router.put("/:id",validateToken, catchError(packageController.update));
router.delete("/:id",validateToken, catchError(packageController.delete));

module.exports = router;
