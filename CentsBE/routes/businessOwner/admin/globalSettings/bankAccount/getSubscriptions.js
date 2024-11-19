const subscriptions = require('../../../../stripe/account/getSubscriptions');

async function getSubscriptions(req, res, next) {
    try {
        const { business } = req.constants;
        if (!business.subscriptionToken) {
            res.status(200).json({
                subscriptions: null,
            });
            return;
        }
        const details = await subscriptions(business.subscriptionToken);
        res.status(200).json({
            success: true,
            subscriptions: details,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = getSubscriptions;
