const payForSubscriptionPipeline = require('../../pipeline/subscription/payForSubscriptionPipeline');

/**
 * Save payment data and create a subscription for a business
 *
 * This API performs the following actions:
 *
 * 1) Create a payment source within Stripe;
 * 2) Attach payment token to Stripe Customer for the business;
 * 3) Create a Stripe Subscription for recurring items;
 * 4) Create a Stripe Charge for one-time items;
 * 5) Create a BusinessSubscription model using Stripe Subscription details;
 * 6) Store terms of service acceptance in our TermsOfService model;
 * 7) Send welcome email to the business owner;
 *
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function payForSubscription(req, res, next) {
    try {
        const pipeline = await payForSubscriptionPipeline(req.body);

        return res.status(200).json({
            success: true,
            pipeline,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = payForSubscription;
