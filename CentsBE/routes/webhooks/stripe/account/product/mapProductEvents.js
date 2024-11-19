const updateStripeProduct = require('./updateStripeProduct');

/**
 * Map the product events to the proper controller method
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 * @returns
 */
async function mapProductEvents(req, res, next) {
    const { event } = req.constants;

    switch (event.type) {
        case 'product.updated':
            return updateStripeProduct(req, res, next);
        case 'product.deleted':
            return updateStripeProduct(req, res, next);
        default:
            throw Error(`Unhandled event type: ${event.type}`);
    }
}

module.exports = exports = mapProductEvents;
