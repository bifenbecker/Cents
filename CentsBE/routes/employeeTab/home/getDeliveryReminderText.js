const momenttz = require('moment-timezone');
const { statuses, orderSmsEvents } = require('../../../constants/constants');

function getDeliveryReminderText(order) {
    const {
        store,
        orderMaster: { delivery },
        status,
        orderType,
        createdAt,
        notificationLogs,
    } = order;
    if (
        status === statuses.READY_FOR_DRIVER_PICKUP ||
        (orderType === 'RESIDENTIAL' && status === statuses.HUB_PROCESSING_COMPLETE)
    ) {
        const { deliveryWindow } = delivery;
        const { timeZone } = store.settings;
        const deliveryTime = momenttz(Number(deliveryWindow[0])).tz(timeZone);
        const deliveryStartHour = deliveryTime.hour();
        const createdAtTime = momenttz(createdAt).tz(timeZone);
        const latestIntentDeliveryNotification = notificationLogs.find(
            (log) => log.eventName === orderSmsEvents.INTENT_ORDER_DELIVERY_NOTIFICATION,
        );
        if (latestIntentDeliveryNotification) {
            const notifiedAt = momenttz(latestIntentDeliveryNotification.notifiedAt).tz(timeZone);
            if (notifiedAt < deliveryTime) {
                return `Sent at 7:00 PM on ${notifiedAt.format('MMMM Do')}`;
            }
            return `Sent at ${notifiedAt.format('h:mm A')} on ${notifiedAt.format('MMMM Do')}`;
        }
        if (createdAtTime.format('DD/MM/YYYY') === deliveryTime.format('DD/MM/YYYY')) {
            if (deliveryStartHour < 19) {
                return '';
            }
            return `Sending at 7:00 PM on ${deliveryTime.format('MMMM Do')}`;
        }
        return `Sending at 7:00 PM on ${deliveryTime.subtract(1, 'day').format('MMMM Do')}`;
    }
    return '';
}

module.exports = exports = getDeliveryReminderText;
