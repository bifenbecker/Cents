const ServiceOrder = require('../../models/serviceOrders');
const StoreSettings = require('../../models/storeSettings');
const eventEmitter = require('../../config/eventEmitter');
const { orderSmsEvents } = require('../../constants/constants');

async function sendLiveLink(req, res, next) {
    try {
        const { id } = req.params;
        const order = await ServiceOrder.query().findById(id);
        const storeSettings = await StoreSettings.query().findOne({
            storeId: order.id,
        });

        if (!storeSettings.hasSmsEnabled) {
            res.status(422).json({
                error: 'This store does not currently have SMS enabled. Please contact a Cents support specialist for help.',
            });
            return;
        }

        eventEmitter.emit('orderSmsNotification', orderSmsEvents.SEND_LIVE_LINK, id);

        res.status(200).json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = sendLiveLink;
