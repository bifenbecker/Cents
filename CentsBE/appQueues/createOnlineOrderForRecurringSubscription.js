const LoggerHandler = require('../LoggerHandler/LoggerHandler');
const createOnlineOrderForRecurringSubscription = require('../workers/orders/createOnlineOrderForRecurringSubscription');

module.exports = async (job, done) => {
    try {
        LoggerHandler(
            'info',
            'creating online orders for recurring subscriptions job started::::::',
        );
        await createOnlineOrderForRecurringSubscription();
        LoggerHandler(
            'info',
            'creating online orders for recurring subscriptions job completed:::::::',
        );
        done();
    } catch (error) {
        LoggerHandler('error', error, { job });
        done(error);
    }
};
