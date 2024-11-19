const createStripeSubscription = require('./createStripeSubscription');

/**
 * Map the customer events to the proper controller method
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 * @returns
 */
async function mapCustomerEvents(req, res, next) {
    const { event } = req.constants;

    switch (event.type) {
        case 'customer.subscription.created':
            return createStripeSubscription(req, res, next);
        default:
            throw Error(`Unhandled event type: ${event.type}`);
    }
}

module.exports = exports = mapCustomerEvents;
