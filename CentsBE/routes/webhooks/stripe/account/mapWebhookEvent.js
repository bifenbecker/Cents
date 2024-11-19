const mapProductEvents = require('./product/mapProductEvents');
const mapPriceEvents = require('./price/mapPriceEvents');
const mapCustomerEvents = require('./customer/mapCustomerEvents');

/**
 * Determine the webhook event type and set it in the request
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function mapWebhookEvent(req, res, next) {
    const { event } = req.constants;
    const formattedEventType = event.type.split('.');
    const eventClassifier = formattedEventType[0];

    switch (eventClassifier) {
        case 'product':
            return mapProductEvents(req, res, next);
        case 'price':
            return mapPriceEvents(req, res, next);
        case 'customer':
            return mapCustomerEvents(req, res, next);
        default:
            throw Error(`Unhandled event type: ${event.type}`);
    }
}

module.exports = exports = mapWebhookEvent;
