const ServiceOrder = require('../../../models/serviceOrders');
const StoreSettings = require('../../../models/storeSettings');
const eventEmitter = require('../../../config/eventEmitter');
const { orderSmsEvents } = require('../../../constants/constants');

async function Notify(req, res, next) {
    try {
        const phoneNumber = req.body.phone;
        const { orderId } = req.body;
        if (!phoneNumber || !orderId) {
            res.status(422).json({
                error: 'phoneNumber and orderId is required.',
            });
            return;
        }
        const order = await ServiceOrder.query()
            .findById(orderId)
            .withGraphFetched('[storeCustomer]');
        const storeSettings = await StoreSettings.query().findOne({
            storeId: order.storeId,
        });

        if (!storeSettings.hasSmsEnabled) {
            res.status(422).json({
                error: 'SMS is currently disabled for this store. Please reach out to Cents Support for additional help.',
            });
            return;
        }
        eventEmitter.emit('orderSmsNotification', orderSmsEvents.READY_FOR_PICKUP, orderId);
        res.status(200).json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = exports = Notify;
