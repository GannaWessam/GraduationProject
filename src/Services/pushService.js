const webpush = require('web-push');
const sequelize = require('../connections/db');
const SubscriptionModel = require('../models/Subscription');
const Subscription = SubscriptionModel(sequelize);
const {addNotification} = require('../modules/Notifications/helper/NotificationHelper');

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.PUBLIC_KEY,
  process.env.PRIVATE_KEY
);

async function saveSubscription(userId, subscription) {
  const { endpoint, keys } = subscription;

  try {
    await Subscription.create({
      userId,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      console.log(`Subscription already exists for user ${userId} and endpoint ${endpoint}`);
    } else {
      console.error('Error saving subscription:', err);
      throw err;
    }
  }
}

async function sendNotificationToUser(userId, payload,translation) {

 try {
  await addNotification(userId,payload,translation);
  const subscriptions = await Subscription.findAll({ where: { userId } });
  if (subscriptions.length === 0) {
    return { success: false, message: `No subscription found for user ${userId}` };
  }
  let sentCount = 0;
  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        JSON.stringify(payload)
      );
      sentCount++;
    } catch (err) {
      if (err.statusCode === 410) {
        console.log(`Removing expired subscription for user ${userId}:`, sub.endpoint);
        await sub.destroy();
      } else {
        console.error(`Push error for user ${userId}:`, err);
      }
    }
  }
 } catch (error) {
  console.log(error);
  
 }

  return sentCount > 0
    ? { success: true, message: `Notification sent to ${sentCount} subscription(s)` }
    : { success: false, message: `All subscriptions for user ${userId} were invalid or removed` };
}

async function sendNotificationToUsers(userIds, payload,translation) {
  const results = [];

  for (const userId of userIds) {
    const result = await sendNotificationToUser(userId, payload,translation);
    results.push({ userId, ...result });
  }

  return results;
}

module.exports = { saveSubscription, sendNotificationToUser, sendNotificationToUsers };
