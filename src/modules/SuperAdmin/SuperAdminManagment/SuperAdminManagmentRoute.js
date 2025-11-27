const express = require("express");
const router = express.Router();
const SuperAdminController = require("./SuperAdminManagmentController");
const catchError = require("../../../middlewares/catchError");


router.get("/",catchError(SuperAdminController.getAll));
router.get("/:id",catchError(SuperAdminController.getById));
router.post("/add-SuperAdmin",catchError(SuperAdminController.register));




module.exports = router;