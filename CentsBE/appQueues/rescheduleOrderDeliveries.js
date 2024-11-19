const LoggerHandler = require('../LoggerHandler/LoggerHandler');
const reschedulepickupandDeliveryOrders = require('../workers/orders/rescheduleOrderDeliveries');

/**
 * Send daily digest email job
 * @param {Object} job
 * @param {Object} done
 */
module.exports = async (job, done) => {
    try {
        LoggerHandler(
            'info',
            'Moving Pickup And Delivery Orders To Next Shift Job Started::::::::::',
        );
        await reschedulepickupandDeliveryOrders();
        LoggerHandler(
            'info',
            'Moving Pickup And Delivery Orders To Next Shift Job Completed::::::::::',
        );
        done();
    } catch (err) {
        LoggerHandler('error', err, { job });
        throw err;
    }
};
