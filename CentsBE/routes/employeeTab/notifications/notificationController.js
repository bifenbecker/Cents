const eventEmitter = require('../../../config/eventEmitter');
const { orderSmsEvents } = require('../../../constants/constants');

/**
 * Send a scheduled text message for a customer given a date and time
 *
 * @param {Object} req
 * @param {Object} res
 * @param {void} next
 */
async function sendScheduledTextMessage(req, res, next) {
    try {
        const { serviceOrderId, dateScheduled } = req.body;
        eventEmitter.emit(
            'orderSmsNotification',
            orderSmsEvents.READY_FOR_PICKUP_SCHEDULED,
            serviceOrderId,
            {},
            { dateScheduled },
        );
        return res.status(200).json({
            success: true,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = exports = { sendScheduledTextMessage };
