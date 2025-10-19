const userServices = require("./usersServices");
const ApiFeature = require("../../../Util/ApiFeatures");
const ApiResponse = require("../../../Util/ApiResponse");

// req.params -> data in URL path (e.g. /users/:id) used to identify a specific resource
// req.query  -> data after ? in URL (e.g. /users?page=2) used for filters, search, or pagination

//todo : users or students?? --- update by status method --- 

const addAdmin = async (req,res) => {
    const result = await userServices.addAdmin(req.body);
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
    
    const result = await userServices.updateUser(id, payload, idImage);
    res.status(200).json(ApiResponse.success(result));
}

const deleteUserById = async (req,res) =>{ //btrga3 num of deleted rows
    const id = req.params.id;
    const result = await userServices.deleteUserById(id);
    res.status(200).json(ApiResponse.success(result))
    
}

const approveStudentByUserId = async (req, res) => {
  const { id } = req.params; 
  const result = await userServices.approveStudentByUserId(id);
  res.status(200).json(ApiResponse.success(result));
};

const getAllUserss = async (req, res) => {
  try {
    const users = await userServices.getAllUserss();
    return res.status(200).json(ApiResponse.success("Users retrieved successfully", users));
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json(ApiResponse.error("Failed to get users", error.message));
  }
};

const updateStudentNationalIdController = async (req, res) => {
  try {
    const userId = req.params.id;
    const { nationalId } = req.body;

    const result = await userServices.updateStudentNationalId(userId, nationalId);

    return res.status(200).json(ApiResponse.success(result));
  } catch (error) {
    console.error("Error updating national ID:", error);
    return res.status(400).json(ApiResponse.error(error.message));
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
    updateStudentNationalIdController
}