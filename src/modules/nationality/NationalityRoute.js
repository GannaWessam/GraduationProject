const express = require("express");
const router = express.Router();
const NationalityController = require("./NationalityController");
const catchError = require("../../middlewares/catchError");


router.get("/", catchError(NationalityController.getAllNationalitysController));


module.exports = router;