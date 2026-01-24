const express = require("express");
const router = express.Router();
const authController = require("../../Auth/AuthController");
const usersController = require("./usersController");
const { uploadSingleFile } = require("../../../fileUpload");
const { validateToken } = require("../../../middlewares/token");
const catchError = require("../../../middlewares/catchError");


router.get("/getUsers", usersController.getAllUserss);

// Add new user (with file upload)
router.post("/addAdmin",
  catchError(usersController.addAdmin)
);

router.put(
  "/updateNationalId/:id",
  validateToken,
  catchError(usersController.updateStudentNationalIdController)
);

router.post(
  "/addUser",
  uploadSingleFile("nationalIdImage"),
  catchError(authController.register)
);

router.get(
  "/byStatus/:status",
  
  catchError(usersController.getAllUsersByStatus)
);  

router.get(
  "/Training/Students",catchError(usersController.getUsersByTrainingIdController)
);
router.get(
  "/Exam/Students",catchError(usersController.getUsersByExamIdController)
);

router.get(
  "/student/:id",
  validateToken,
  catchError(usersController.getStudentByIdController)
);


router.get(
  "/:id",
  validateToken,
  catchError(usersController.getUserById)
);


router.get(
  "/",
  validateToken,
  catchError(usersController.getAllUsers)
);


router.delete(
  "/delete/:id",
  validateToken,
  catchError(usersController.deleteUserById)
);

router.put(
  "/:id",
  validateToken,
  uploadSingleFile("nationalIdImage"),
  catchError(usersController.updateUser)
)

router.put(
  "/approve/:id", 
  validateToken,
  catchError(usersController.approveStudentByUserId)
);


router.get("/get", usersController.getAllUserss);
module.exports = router;    