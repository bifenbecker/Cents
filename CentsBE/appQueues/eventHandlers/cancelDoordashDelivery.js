const LoggerHandler = require('../../LoggerHandler/LoggerHandler');
const cancelDoordashDeliveryUow = require('../../uow/delivery/doordash/cancelDoorDashDeliveryUow');

/**
 * Cancels DoorDash delivery via DoorDash API
 *
 * @param {Object} job
 * @param {void} done
 */
async function cancelDoordashDelivery(job, done) {
    try {
        LoggerHandler('info', 'Event received in cancelDoordashDelivery app queue', job.data);

        await cancelDoordashDeliveryUow(job.data);
        done();
    } catch (error) {
        LoggerHandler('error', error, {
            manualMessage: 'Error occurred while canceling the doordash delivery',
            job,
        });

        done(error);
    }
}

module.exports = exports = cancelDoordashDelivery;
