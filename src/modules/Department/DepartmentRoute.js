const express = require("express");
const router = express.Router();
const DepartmentController = require("./DepartmentController");
const catchError = require("../../middlewares/catchError");
const { validateToken } = require("../../middlewares/token");
const checkPermission = require("../../middlewares/checkPermission");

router.post(
  "/",
  // checkPermission("createDepartment"),
  catchError(DepartmentController.addDepartment)
);
router.get(
  "/",
  // checkPermission("getDepartments"),
  catchError(DepartmentController.getAllDepartmentsController)
);
router.get(
  "/college/:id",
  // checkPermission("getDepartment"),
  catchError(DepartmentController.getAllDepartmentsInCollegeController)
);
router.get(
  "/:id",
  // checkPermission("getDepartment"),
  catchError(DepartmentController.getDepartmentById)
);
router.put(
  "/:id",
  // checkPermission("updateDepartment"),
  catchError(DepartmentController.updateDepartment)
);
router.delete(
  "/:id",
  // checkPermission("deleteDepartment"),
  catchError(DepartmentController.deleteDepartment)
);

module.exports = router;