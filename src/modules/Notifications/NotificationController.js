const { saveSubscription, sendNotificationToUser, sendNotificationToUsers } = require('../../Services/pushService');
const {getAllNotificationToUserService} = require('./NotificationService');
const ApiResponse = require("../../Util/ApiResponse");

exports.subscribeUser = async (req, res, next) => {
  try {
    const { userId, subscription } = req.body;
    if (!userId || !subscription) {
      return res.status(400).json({ error: 'Missing userId or subscription' });
    }
    await saveSubscription(userId, subscription);
    res.json({ success: true });
  } catch (error) {
    return next(error);
  }
};

exports.sendToSingleUser = async (req, res, next) => {
  try {
    const payload = req.body;
    const result =await sendNotificationToUser(req.params.userId, payload);
    res.json(result);
  } catch (error) {
    return next(error);
  }
};

exports.sendToMultipleUsers = async (req, res, next) => {
  try {
    const { userIds, title , body } = req.body;
    console.log(req.body);
    
    const payload = {
      title: title,
      body: body
    }  
    
    if (!Array.isArray(userIds)) {
      return res.status(400).json({ error: 'userIds must be an array' });
    }
    const result=await sendNotificationToUsers(userIds, payload);
    res.json(result);
  } catch (error) {
    return next(error);
  }
};


exports.getAllNotificationToUserController = async (req, res) => {
  const result = await getAllNotificationToUserService(req.params.id);
  return res.status(200).json(ApiResponse.success(result));
};