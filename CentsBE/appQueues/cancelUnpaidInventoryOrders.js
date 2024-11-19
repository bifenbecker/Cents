const LoggerHandler = require('../LoggerHandler/LoggerHandler');
const cancelUnpaidInventoryOrders = require('../workers/orders/cancelUnpaidInventoryOrders');

/**
 * Cancel unpaid inventory orders job
 * @param {Object} job
 * @param {Object} done
 */
module.exports = async (job, done) => {
    try {
        LoggerHandler('info', 'Cancel unpaid inventory orders Job Started::::::::::');
        await cancelUnpaidInventoryOrders();
        LoggerHandler('info', 'Cancel unpaid inventory orders Job Completed::::::::::');
        done();
    } catch (err) {
        LoggerHandler('error', err, { job });
        throw err;
    }
};
