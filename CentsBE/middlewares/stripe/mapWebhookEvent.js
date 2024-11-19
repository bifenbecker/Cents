/**
 * Determine the webhook event type and set it in the request
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function mapWebhookEvent(req, res, next) {
    try {
        req.constants = req.constants || {};

        const { event } = req.constants;

        const formattedEventType = event.type.split('.');
        const eventClassifier = formattedEventType[0];

        req.constants.eventClassifier = eventClassifier;

        return next();
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = mapWebhookEvent;
