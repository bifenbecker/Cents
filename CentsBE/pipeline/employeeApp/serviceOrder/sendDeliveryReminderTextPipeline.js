const Pipeline = require('../../pipeline');

// uow
const sendDeliveryReminderTextUow = require('../../../uow/order/sendDeliveryReminderTextUow');

async function sendDeliveryReminderTextPipeline(payload) {
    const sendDeliveryReminderTextPipeline = new Pipeline([sendDeliveryReminderTextUow]);
    const result = await sendDeliveryReminderTextPipeline.run(payload);
    return result;
}

module.exports = exports = sendDeliveryReminderTextPipeline;
