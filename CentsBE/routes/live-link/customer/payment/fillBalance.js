const LoggerHandler = require('../../../../LoggerHandler/LoggerHandler');
const StoreCustomer = require('../../../../models/storeCustomer');
const Store = require('../../../../models/store');
const updateBalancePipeline = require('../../../../pipeline/liveLink/updateBalancePipeline');

async function fillBalance(req, res, next) {
    try {
        const {
            currentCustomer,
            currentCustomer: { id: customerId },
            body: { paymentMethodToken, credits, storeId },
        } = req;

        const store = await Store.query().findById(storeId).select('businessId');

        let storeCustomer = await StoreCustomer.query().findOne({
            centsCustomerId: customerId,
            storeId,
        });

        if (!storeCustomer) {
            storeCustomer = await StoreCustomer.query().insert({
                firstName: currentCustomer.firstName,
                lastName: currentCustomer.lastName,
                email: currentCustomer.email,
                phoneNumber: currentCustomer.phoneNumber,
                centsCustomerId: currentCustomer.id,
                businessId: store.businessId,
                storeId,
                isDeleted: false,
                creditAmount: 0,
            });
        }

        const result = await updateBalancePipeline({
            credits,
            paymentMethodToken,
            currentCustomer,
            storeCustomer,
        });

        return res.status(200).json({
            ...result,
            success: true,
        });
    } catch (error) {
        LoggerHandler('error', error);

        return next(error);
    }
}

module.exports = exports = fillBalance;
