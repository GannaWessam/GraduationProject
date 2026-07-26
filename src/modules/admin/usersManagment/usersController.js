const userServices = require("./usersServices");
const ApiFeature = require("../../../Util/ApiFeatures");
const ApiResponse = require("../../../Util/ApiResponse");

// req.params -> data in URL path (e.g. /users/:id) used to identify a specific resource
// req.query  -> data after ? in URL (e.g. /users?page=2) used for filters, search, or pagination

//todo : users or students?? --- update by status method --- 

const addAdmin = async (req,res) => {
    const result = await userServices.addAdmin(req.body);
    const pre = await userServices.assignPermissionsToUser(result.userId,req.body.list);

    res.status(200).json(ApiResponse.success(result));
}

const getUserById = async (req,res) => {
    const id = req.params.id;
    const result = await userServices.getuUserById(id);
    res.status(200).json(ApiResponse.success(result));
}

const getAllUsers = async (req,res) => { //mfesh try&catch 3lshan ha wrap b catchError
    const features = new ApiFeature(req.query)
        .filter()
        .search()
        .sort()
        .pagination()
        .selectedFields();
    const result = await userServices.getAllUsers(features); //variable feh kol el db options elly elclass tl3ha
    res.status(200).json(ApiResponse.success(result));
}

const getAllUsersByStatus = async (req,res) => {
    const features = new ApiFeature(req.query)
        .filter()
        .search()
        .sort()
        .pagination()
        .selectedFields();
    const {status} = req.params;
    const result = await userServices.getAllUsersByStatus(status,features); 
    res.status(200).json(ApiResponse.success(result));
}

const updateUser = async (req, res) => {
    const id = req.params.id;
    const payload = req.body;
    const idImage = req.file?.filename // ******* zy el register
    
    const result = await userServices.updateUser(id, payload, idImage,req);
    res.status(200).json(ApiResponse.success(result));
}

const deleteUserById = async (req,res) =>{ //btrga3 num of deleted rows
    const id = req.params.id;
    const result = await userServices.deleteUserById(id);
    res.status(200).json(ApiResponse.success(result))
    
}

const approveStudentByUserId = async (req, res) => {
  const { id } = req.params; 
  const result = await userServices.approveStudentByUserId(id,req);
  res.status(200).json(ApiResponse.success(result));
};

const getAllUserss = async (req, res, next) => {
  try {
    const users = await userServices.getAllUserss();
    return res.status(200).json(ApiResponse.success("Users retrieved successfully", users));
  } catch (error) {
    return next(error);
  }
};

const updateStudentNationalIdController = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { nationalId } = req.body;

    const result = await userServices.updateStudentNationalId(userId, nationalId,req);

    return res.status(200).json(ApiResponse.success(result));
  } catch (error) {
    return next(error);
  }
};


async function getStudentByIdController(req, res, next) {
  try {
    const { id } = req.params;
    const student = await userServices.getStudentById(id);
    res.status(200).json({
      status: "success",
      message: "Student fetched successfully",
      data: student,
    });
  } catch (error) {
    return next(error);
  }
}

async function getUsersByTrainingIdController(req, res, next) {
  try {
    const features = new ApiFeature(req.query)
      .filter()
      .search()
      .sort()
      .pagination()
      .selectedFields();

    const { trainingId } = req.params;

    const data = await userServices.getUsersByTrainingId(
      trainingId,
      features
    );

    res.status(200).json(ApiResponse.success(data));
  } catch (error) {
    next(error);
  }
}

async function getUsersByExamIdController(req, res, next) {
  try {
    const features = new ApiFeature(req.query)
      .filter()
      .search()
      .sort()
      .pagination()
      .selectedFields();

    const { examId } = req.params;

    const data = await userServices.getUsersByExamId(
      examId,
      features
    );

    res.status(200).json(ApiResponse.success(data));
  } catch (error) {
    next(error);
  }
}


const assignPermissionsToUserController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;

    const result = await userServices.assignPermissionsToUser(
      id,
      permissions,
      req
    );

    return res.status(200).json(
      ApiResponse.success("Permissions assigned successfully", result)
    );
  } catch (error) {
    return next(error);
  }
};

const getUserExamsController = async (req, res) => {
  try {
    const { userId } = req.params;
    const features = new ApiFeature(req.query)
      .filter()
      .search()
      .sort()
      .pagination()
      .selectedFields();

    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId required' });
    }

    const exams = await userServices.getUserExams(userId,features);

    res.status(200).json(ApiResponse.success(exams));
  } catch (error) {
    console.error('Erorr', error);
    res.status(500).json({ success: false, message: 'Erorr', error: error.message });
  }
};
const getAllReservationsForUser=async(req,res,next) => {
  const userId=req.userData.id
  try {
    const result = await userServices.getUserReservations(userId)
    res.status(200).json(ApiResponse.success(result,"Reservations fetched sucessfully"))
  } catch (error) {
    return next(error)
  }

}
const exportPaidStudentsExcelController = async (req, res, next) => {
  try {
    const workbook = await userServices.exportPaidStudentsExcel();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="PaidStudents.xlsx"'
    );

    await workbook.xlsx.write(res);

    res.end();
  } catch (err) {
    next(err);
  }
};

const exportUsersExcel = async (req, res) => {
  const features = new ApiFeature(req.query)
    .filter()
    .search()
    .sort()
    .selectedFields();

  const workbook = await userServices.exportUsersExcel(features);

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  res.setHeader(
    "Content-Disposition",
    'attachment; filename="students.xlsx"'
  );

  await workbook.xlsx.write(res);

  res.end();
};

const getUsersByEventId = async (req, res) => {
  const features = new ApiFeature(req.query)
    .filter()
    .search()
    .sort()
    .pagination()
    .selectedFields();

  const { eventId } = req.params;

  const result = await userServices.getUsersByEventIdService(
    eventId,
    features
  );

  res.status(200).json(ApiResponse.success(result));
};


const exportUsersController = async (req, res) => {
  const { status, type = "excel" } = req.query;

  // Remove only "type" from filters
  const query = { ...req.query };
  delete query.type;

  const features = new ApiFeature(query)
    .filter()
    .search()
    .sort()
    .selectedFields();

  const result = await userServices.exportUsers(
    features,
    status,
    type
  );

  if (type === "pdf") {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="students.pdf"'
    );

    result.pipe(res);
    result.end();
    return;
  }

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  res.setHeader(
    "Content-Disposition",
    'attachment; filename="students.xlsx"'
  );

  await result.xlsx.write(res);
  res.end();
};

const passTraining = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const result = await userServices.passTrainingService(userId);

    res.status(200).json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
};

const switchUserProductController = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { productId } = req.body;

    const result = await userServices.switchUserProduct(
      userId,
      productId,
      req
    );

    res.status(200).json({
      success: true,
      message: "Product switched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const cancelReservationController = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.body;
    const result = await userServices.cancelReservation(userId, eventId ,req);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
    getAllUsers,
    getAllUsersByStatus,
    deleteUserById,
    getUserById,
    updateUser,
    addAdmin,
    approveStudentByUserId,
    getAllUserss,
    updateStudentNationalIdController,
    getStudentByIdController,
    getUsersByTrainingIdController,
    getUsersByExamIdController,
    assignPermissionsToUserController,
    getUserExamsController,
    getAllReservationsForUser,
    exportPaidStudentsExcelController,
    exportUsersExcel,
    getUsersByEventId,
    exportUsersController,
    passTraining,
    switchUserProductController,
    cancelReservationController
}