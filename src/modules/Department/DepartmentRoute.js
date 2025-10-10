const express = require("express");
const router = express.Router();
const DepartmentController = require("./DepartmentController");
const catchError = require("../../middlewares/catchError");

router.post("/", catchError(DepartmentController.addDepartment));
router.get("/", catchError(DepartmentController.getAllDepartmentsController));
router.get("/:id", catchError(DepartmentController.getDepartmentById));
router.put("/:id", catchError(DepartmentController.updateDepartment));
router.delete("/:id", catchError(DepartmentController.deleteDepartment));

module.exports = router;