const { notification } = require("../../models");
const ApiFeature = require("../../Util/ApiFeatures");
const PaginatedResponse = require("../../Util/PaginatedResponse");


async function getAllNotificationToUserService(userId) {

    const res = await notification.findAll({where:{userId}});
    

    return{res} 
    
}

module.exports = {
    getAllNotificationToUserService,
    
};