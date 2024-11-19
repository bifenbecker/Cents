const LoggerHandler = require('../../LoggerHandler/LoggerHandler');
const {
    sendDeliveryOrderEmailToBusinessOwner,
} = require('../../uow/delivery/pickup/sendDeliveryOrderEmailToBusinessOwnerUow');

async function onlineOrderSubmitNotification(job, done) {
    try {
        await sendDeliveryOrderEmailToBusinessOwner(job.data);
        LoggerHandler('info', 'Email notification triggered successfully::::::');
        done();
    } catch (error) {
        LoggerHandler('error', error, {
            manualMessage: 'Error occurred while sending sms.',
            job,
        });
        done(error);
    }
}

module.exports = exports = onlineOrderSubmitNotification;
