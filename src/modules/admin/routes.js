const express = require("express");
const router = express.Router();
const usersRoutes = require("./usersManagment/usersRouts");

router.use("/usersManagment", usersRoutes);

module.exports = router;