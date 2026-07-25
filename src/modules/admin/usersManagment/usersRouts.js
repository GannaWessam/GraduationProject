const express = require("express");
const router = express.Router();
const authController = require("../../Auth/AuthController");
const usersController = require("./usersController");
const { uploadSingleFile } = require("../../../fileUpload");
const { validateToken } = require("../../../middlewares/token");
const catchError = require("../../../middlewares/catchError");
const checkPermission = require("../../../middlewares/checkPermission");

router.get(
  "/getUsers",
  validateToken,
  // checkPermission("VIEW_USER"),
  catchError(usersController.getAllUserss)
);

router.post(
  "/addAdmin",
  validateToken,
  // checkPermission("ADD_ADMIN"),
  catchError(usersController.addAdmin)
);

router.put(
  "/updateNationalId/:id",
  validateToken,
  // checkPermission("EDIT_USER"),
  catchError(usersController.updateStudentNationalIdController)
);

router.post(
  "/addUser",
  validateToken,
  // checkPermission("ADD_USER"),
  uploadSingleFile("nationalIdImage"),
  catchError(authController.register)
);

router.get(
  "/byStatus/:status",
  validateToken,
  // checkPermission("VIEW_USER"),
  catchError(usersController.getAllUsersByStatus)
);  

router.get(
  "/Training/:trainingId/Students",
  validateToken,
  catchError(usersController.getUsersByTrainingIdController)
);
router.get(
  "/Exam/:examId/Students",
  validateToken,
  catchError(usersController.getUsersByExamIdController)
);

router.get(
  "/student/:id",
  validateToken,
  catchError(usersController.getStudentByIdController)
);

router.get(
  "/:id",
  validateToken,
  // checkPermission("VIEW_USER"),
  catchError(usersController.getUserById)
);

router.get(
  "/",
  validateToken,
  // checkPermission("VIEW_USER"),
  catchError(usersController.getAllUsers)
);

router.delete(
  "/delete/:id",
  validateToken,
  // checkPermission("DELETE_USER"),
  catchError(usersController.deleteUserById)
);

router.put(
  "/:id",
  validateToken,
  // checkPermission("ACCEPT_USER"),
  uploadSingleFile("nationalIdImage"),
  catchError(usersController.updateUser)
);

router.put(
  "/approve/:id", 
  validateToken,
  // checkPermission("ACCEPT_USER"),
  catchError(usersController.approveStudentByUserId)
);

router.get(
  "/get",
  validateToken,
  // checkPermission("VIEW_USER"),
  catchError(usersController.getAllUserss)
);

router.get('/Exam/:userId', catchError(usersController.getUserExamsController));

router.post(
  "/:id/permissions",
  validateToken,
  catchError(usersController.assignPermissionsToUserController)
);
router.get(
  "/users/registration",
  validateToken,
  catchError(usersController.getAllReservationsForUser)
) 

router.get(
  "/paid/excel",
  validateToken,
  catchError(usersController.exportPaidStudentsExcelController)
);

router.get(
  "/export/excel",
  validateToken,
  catchError(usersController.exportUsersExcel)
);

router.get(
  "/:eventId/users",
  validateToken,
  catchError(usersController.getUsersByEventId)
);

router.get(
  "/export/pdfExcel",
  validateToken,
  catchError(usersController.exportUsersController)
);


router.put("/passTraining/:userId",
  validateToken,
  catchError(usersController.passTraining));

router.put("/switch-product/:userId",
  validateToken,
  catchError(usersController.switchUserProductController));

router.delete(
    "/reservation/:eventId",
    validateToken,
    catchError(usersController.cancelReservationController)
  );

module.exports = router;    