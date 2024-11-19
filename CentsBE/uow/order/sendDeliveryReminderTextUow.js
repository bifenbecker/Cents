const eventEmitter = require('../../config/eventEmitter');
const { orderSmsEvents } = require('../../constants/constants');
const ServiceOrder = require('../../models/serviceOrders');
const getDeliveryReminderText = require('../../routes/employeeTab/home/getDeliveryReminderText');

async function sendDeliveryReminderTextUow(payload) {
    const { serviceOrderId, storeId } = payload;
    const serviceOrder = await ServiceOrder.query()
        .findById(serviceOrderId)
        .withGraphFetched(
            `[notificationLogs(reverse), order as orderMaster.[delivery.[timing]],
        store(filterDetails).[settings]]`,
        )
        .modifiers({
            reverse: (query) => {
                query.orderBy('id', 'desc');
            },
            filterDetails: (query) => {
                query.select('id').where('id', storeId);
            },
        });
    const {
        store: { settings: storeSettings },
    } = serviceOrder;
    if (!storeSettings.hasSmsEnabled) {
        throw new Error(
            'SMS is currently disabled for this store. Please reach out to Cents Support for additional help.',
        );
    }
    eventEmitter.emit(
        'orderSmsNotification',
        orderSmsEvents.INTENT_ORDER_DELIVERY_NOTIFICATION,
        serviceOrderId,
    );
    const deliveryReminderText = await getDeliveryReminderText(serviceOrder);
    return {
        deliveryReminderText,
    };
}
module.exports = exports = sendDeliveryReminderTextUow;
