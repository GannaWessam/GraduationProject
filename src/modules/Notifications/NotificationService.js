const { notification } = require("../../models");
const ApiFeature = require("../../Util/ApiFeatures");
const PaginatedResponse = require("../../Util/PaginatedResponse");


async function getAllNotificationToUserService(userId) {
    const res = await notification.findAll({where:{userId}});
    return{res} 
    
}
async function markAllAsRead(id) {
    const res = await notification.update({Status:"Read"},{where:{userId:id}})
    return {res}
}
async function getDilveredCount(id) {
    const res = await notification.count({
        where:{
            Status:"dilevered",
            userId:id
        }
    })
    return {res}
}

module.exports = {
    getAllNotificationToUserService,
    markAllAsRead,
    getDilveredCount
};