const { sendSMS, createOrderNotificationLog } = require('../../workers/sms');
const LoggerHandler = require('../../LoggerHandler/LoggerHandler');

async function notifyAndLogSMS(job) {
    try {
        const { message, phoneNumber, orderId, orderStatus, languageId } = job.data;
        const sms = await sendSMS({ message, phoneNumber });
        await createOrderNotificationLog({
            orderId,
            sms,
            phoneNumber,
            orderStatus,
            languageId,
        });
    } catch (error) {
        LoggerHandler('error', error, { manualMessage: 'Error occurred while sending sms.', job });
    }
}

module.exports = exports = { notifyAndLogSMS };
