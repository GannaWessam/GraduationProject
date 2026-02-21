const service = require("./gradeService");
const ApiFeature = require("../../Util/ApiFeatures");
const ApiResponse = require("../../Util/ApiResponse");



const getAllReservations = async (req, res, next) => {
    try {
      const { eventId } = req.params;
      const features = new ApiFeature(req.query)
        .filter()
        .search()
        .sort()
        .pagination()
        .selectedFields();
  
      const result = await service.getAllReservationsByEvent(eventId,features);
  
      res
        .status(200)
        .json(ApiResponse.success(result, "Reservations retrieved successfully"));
        
    } catch (error) {
      next(error);
    }
  };


const getReservationsByUserId = async (req, res, next) => {
  try {
  const features = new ApiFeature(req.query)
  .filter()          
  .search()          
  .sort()            
  .pagination()      
  .selectedFields(); 
    const { userId } = req.params;

    const data = await service.getReservationsByUserId(userId,features);

    res.status(200).json(ApiResponse.success(data,"Grades retrieved successfully"));

  } catch (error) {
    next(error);
  }
};


module.exports = {
  getAllReservations,
  getReservationsByUserId,
};