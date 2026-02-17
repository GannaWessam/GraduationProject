const { saveSubscription, sendNotificationToUser, sendNotificationToUsers } = require('../../Services/pushService');
const {getAllNotificationToUserService, markAllAsRead, getDilveredCount} = require('./NotificationService');
const ApiResponse = require("../../Util/ApiResponse");

exports.subscribeUser = async (req, res, next) => {
  try {
    const { userId, subscription } = req.body;
    if (!userId || !subscription) {
      return res.status(400).json({ error: 'Missing userId or subscription' });
    }
    await saveSubscription(userId, subscription);

    if (req.audit) {
      req.audit.message =
        "User subscribed to notifications successfully | تم اشتراك المستخدم في الإشعارات بنجاح";
    }

    res.json({ success: true });
  } catch (error) {
    return next(error);
  }
};

exports.sendToSingleUser = async (req, res, next) => {
  try {
    const payload = req.body;
    const result = await sendNotificationToUser(req.params.userId, payload);

    if (req.audit) {
      req.audit.message =
        "Notification sent to user successfully | تم إرسال الإشعار إلى المستخدم بنجاح";
    }

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
    const result = await sendNotificationToUsers(userIds, payload);

    if (req.audit) {
      req.audit.message =
        "Notifications sent to multiple users successfully | تم إرسال الإشعارات إلى عدة مستخدمين بنجاح";
    }

    res.json(result);
  } catch (error) {
    return next(error);
  }
};


exports.getAllNotificationToUserController = async (req, res) => {
  const result = await getAllNotificationToUserService(req.params.id);

  if (req.audit) {
    req.audit.message =
      "Fetched user notifications successfully | تم جلب إشعارات المستخدم بنجاح";
  }

  return res.status(200).json(ApiResponse.success(result));
};

exports.MakeAllNotificationReadController = async (req, res) => {
  const result = await markAllAsRead(req.params.id);

  if (req.audit) {
    req.audit.message =
      "Marked all notifications as read successfully | تم وضع علامة مقروء على جميع الإشعارات بنجاح";
  }

  return res.status(200).json(ApiResponse.success(result));
};

exports.GetDileveredNotificationCount = async (req, res) => {
  const result = await getDilveredCount(req.params.id);

  if (req.audit) {
    req.audit.message =
      "Fetched delivered notifications count successfully | تم جلب عدد الإشعارات المرسلة بنجاح";
  }

  return res.status(200).json(ApiResponse.success(result));
};