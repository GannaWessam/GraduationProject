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
  return Subscription.upsert({
    userId,
    endpoint,
    p256dh: keys.p256dh,
    auth: keys.auth,
  });
}

async function sendNotificationToUser(userId, payload) {
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

  if(sentCount > 0){
    addNotification(userId,payload);
  }

  return sentCount > 0
    ? { success: true, message: `Notification sent to ${sentCount} subscription(s)` }
    : { success: false, message: `All subscriptions for user ${userId} were invalid or removed` };
}

async function sendNotificationToUsers(userIds, payload) {
  const results = [];

  for (const userId of userIds) {
    const result = await sendNotificationToUser(userId, payload);
    results.push({ userId, ...result });
  }

  return results;
}

module.exports = { saveSubscription, sendNotificationToUser, sendNotificationToUsers };
