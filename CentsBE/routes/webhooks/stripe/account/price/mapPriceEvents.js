const updateStripePrice = require('./updateStripePrice');

/**
 * Map the price events to the proper controller method
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 * @returns
 */
async function mapPriceEvents(req, res, next) {
    const { event } = req.constants;

    switch (event.type) {
        case 'price.updated':
            return updateStripePrice(req, res, next);
        case 'price.deleted':
            return updateStripePrice(req, res, next);
        default:
            throw Error(`Unhandled event type: ${event.type}`);
    }
}

module.exports = exports = mapPriceEvents;
