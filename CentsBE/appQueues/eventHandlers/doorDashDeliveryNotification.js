const LoggerHandler = require('../../LoggerHandler/LoggerHandler');
const sendTextMessageToCustomer = require('../../uow/delivery/dropoff/sendTextMessageToCustomerUow');

/**
 * Send a text message to the customer for DoorDash deliveries
 *
 * @param {Object} job
 * @param {void} done
 */
async function doorDashDeliveryNotification(job, done) {
    try {
        await sendTextMessageToCustomer(job.data);
        LoggerHandler('info', 'SMS notification triggered successfully::::::');
        done();
    } catch (error) {
        LoggerHandler('error', error, { manualMessage: 'Error occurred while sending sms.', job });
        done(error);
    }
}

module.exports = exports = doorDashDeliveryNotification;
