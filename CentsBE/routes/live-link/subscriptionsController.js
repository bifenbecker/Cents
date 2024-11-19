const updateSubscriptionPipeline = require('../../pipeline/recurringSubscriptions/updateRecurringSubscription');

const listSubscriptionsPipeline = require('../../pipeline/liveLink/listSubscriptionsPipeline');

const updateSubscription = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { subscription } = req.constants;
        const { timeZone } = subscription.store.settings.timeZone;
        const { mappedSubscription } = await updateSubscriptionPipeline({
            ...req.body,
            subscription,
            id,
            timeZone,
        });
        res.status(200).json({
            success: true,
            subscription: mappedSubscription,
        });
    } catch (error) {
        next(error);
    }
};

const listSubscriptions = async (req, res, next) => {
    try {
        const { currentCustomer: centsCustomer } = req;

        const payload = {
            centsCustomer,
        };

        const output = await listSubscriptionsPipeline(payload);
        res.status(200).json({
            success: true,
            subscriptions: output.formattedResponse,
        });
    } catch (error) {
        next(error);
    }
};
module.exports = exports = {
    updateSubscription,
    listSubscriptions,
};
