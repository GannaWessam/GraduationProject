const { getAllSystemData, updateSystemDataById } = require("./systemDataSrevice");


const getAllSystemDataController = async (req, res, next) => {
  try {
    const features = {
      page: req.query.page,
      limit: req.query.limit,
      options: req.query.options || {},
    };

    const data = await getAllSystemData(features);
    res.status(200).json({
      status: 200,
      message: "System data retrieved successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};


const updateSystemDataController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateInfo = req.body;
    const updatedData = await updateSystemDataById(id, updateInfo,req);

    res.status(200).json({
      status: 200,
      message: "System data updated successfully",
      data: updatedData,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSystemDataController,
  updateSystemDataController,
};