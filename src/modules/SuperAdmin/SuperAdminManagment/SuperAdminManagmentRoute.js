const express = require("express");
const router = express.Router();
const SuperAdminController = require("./SuperAdminManagmentController");
const catchError = require("../../../middlewares/catchError");
const { validateToken } = require("../../../middlewares/token");

router.get("/",validateToken,catchError(SuperAdminController.getAll));
router.get("/:id",validateToken,catchError(SuperAdminController.getById));
router.put("/:id",validateToken,catchError(SuperAdminController.update));
router.post("/add-SuperAdmin",validateToken,catchError(SuperAdminController.register));




module.exports = router;