const Pipeline = require('../pipeline');
const LoggerHandler = require('../../LoggerHandler/LoggerHandler');
const updateStoreCustomerBalanceUow = require('../../uow/liveLink/customer/payment/updateStoreCustomerBalanceUow');
const updateStripeBalanceUow = require('../../uow/liveLink/customer/payment/updateCustomerStripeBalanceUow');

async function updateBalancePipeline(payload) {
    try {
        const processFillBalance = new Pipeline([
            updateStripeBalanceUow,
            updateStoreCustomerBalanceUow,
        ]);

        return processFillBalance.run(payload);
    } catch (error) {
        LoggerHandler('error', error, payload);
        throw error;
    }
}

module.exports = exports = updateBalancePipeline;
