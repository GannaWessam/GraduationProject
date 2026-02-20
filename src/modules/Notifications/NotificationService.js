const { notification } = require("../../models");
const ApiFeature = require("../../Util/ApiFeatures");
const PaginatedResponse = require("../../Util/PaginatedResponse");


async function getAllNotificationToUserService(userId, features) {
    const page = features.page * 1 || 1;
    const limit = features.limit * 1 || 10;
    const offset = (page - 1) * limit;
  
    const { count, rows } = await notification.findAndCountAll({
      where: { userId },
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });
  
    return PaginatedResponse.fromApiFeature(
      features,
      count,
      rows,
      "Notifications fetched successfully"
    );
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