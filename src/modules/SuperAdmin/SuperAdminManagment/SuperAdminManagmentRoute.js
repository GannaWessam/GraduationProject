const express = require("express");
const router = express.Router();
const SuperAdminController = require("./SuperAdminManagmentController");
const catchError = require("../../../middlewares/catchError");
const { validateToken } = require("../../../middlewares/token");
const checkPermission = require("../../../middlewares/checkPermission");

router.get("/",validateToken,checkPermission("VIEW_SUPERADMIN"),catchError(SuperAdminController.getAll));
router.get("/:id",validateToken,checkPermission("VIEW_SUPERADMIN"),catchError(SuperAdminController.getById));
router.post("/add-SuperAdmin",validateToken,checkPermission("ADD_SUPERADMIN"),catchError(SuperAdminController.register));




module.exports = router;