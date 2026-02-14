const express = require("express");
const router = express.Router();
const DepartmentController = require("./DepartmentController");
const catchError = require("../../middlewares/catchError");
const { validateToken } = require("../../middlewares/token");
const checkPermission = require("../../middlewares/checkPermission");

router.post(
  "/",
  validateToken,
  // checkPermission("createDepartment"),
  catchError(DepartmentController.addDepartment)
);
router.get(
  "/",
  validateToken,
  // checkPermission("getDepartments"),
  catchError(DepartmentController.getAllDepartmentsController)
);
router.get(
  "/college/:id",
  validateToken,
  // checkPermission("getDepartment"),
  catchError(DepartmentController.getAllDepartmentsInCollegeController)
);
router.get(
  "/:id",
  validateToken,
  // checkPermission("getDepartment"),
  catchError(DepartmentController.getDepartmentById)
);
router.put(
  "/:id",
  validateToken,
  // checkPermission("updateDepartment"),
  catchError(DepartmentController.updateDepartment)
);
router.delete(
  "/:id",
  validateToken,
  // checkPermission("deleteDepartment"),
  catchError(DepartmentController.deleteDepartment)
);

module.exports = router;