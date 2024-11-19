const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Construct the Stripe webhook event and
 * set the stripe event into request constant
 *
 * https://stripe.com/docs/webhooks/signatures#verify-official-libraries
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function constructWebhookEvent(req, res, next) {
    try {
        req.constants = req.constants || {};

        const stripeReqSignature = req.headers['stripe-signature'];
        const event = stripe.webhooks.constructEvent(
            req.body,
            stripeReqSignature,
            process.env.STRIPE_ACCOUNT_WEBHOOK_SECRET,
        );

        req.constants.event = event;
        return next();
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = constructWebhookEvent;
