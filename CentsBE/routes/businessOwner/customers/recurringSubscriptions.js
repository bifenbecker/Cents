const listSubscriptionsUOW = require('../../../uow/liveLink/serviceOrders/listSubscriptionsUow');

const getSubscriptionsList = async (req, res, next) => {
    try {
        const { centsCustomer, storeIds } = req;

        const payload = {
            centsCustomer,
            storeIds,
        };

        const output = await listSubscriptionsUOW(payload);
        res.status(200).json({
            success: true,
            subscriptions: output.formattedResponse,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getSubscriptionsList,
};
