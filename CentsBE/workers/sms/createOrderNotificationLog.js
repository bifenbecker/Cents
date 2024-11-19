const NotificationLog = require('../../models/orderNotificationLog');

async function createOrderNotificationLog({
    orderId,
    orderStatus,
    phoneNumber,
    sms,
    languageId,
    eventName,
}) {
    await NotificationLog.query().insert({
        orderId,
        status: orderStatus,
        phoneNumber,
        notifiedAt: sms.dateCreated.toISOString(),
        languageId,
        eventName,
    });
}

module.exports = exports = createOrderNotificationLog;
