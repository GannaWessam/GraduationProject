const express = require("express");
const router = express.Router();
const AdminController = require("./AdminManagmentController");
const catchError = require("../../../middlewares/catchError");


router.get("/",catchError(AdminController.getAll));
router.get("/:id",catchError(AdminController.getById));
router.post("/add-Admin",catchError(AdminController.register));
router.put("/:id", AdminController.update);
router.delete("/:id", AdminController.remove);





module.exports = router;