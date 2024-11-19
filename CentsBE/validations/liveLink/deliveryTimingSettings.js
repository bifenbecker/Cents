const {
    deliveryProviders,
    orderDeliveryStatuses,
    ORDER_TYPES,
} = require('../../constants/constants');
const pickupAndDeliveryDetails = require('../../uow/liveLink/serviceOrders/pickupAndDeliveryDetails');
const CustomQuery = require('../../services/customQuery');
const StoreSettings = require('../../models/storeSettings');

function hasOrderDeliveryChanged(ogRecord, newRecord) {
    return (
        ogRecord &&
        newRecord &&
        (ogRecord.deliveryProvider !== newRecord.deliveryProvider ||
            ogRecord.timingsId !== newRecord.timingsId)
    );
}

function isOwnDelivery(record) {
    return (
        record &&
        record.deliveryProvider &&
        record.deliveryProvider === deliveryProviders.OWN_DRIVER
    );
}

async function hasDeliverySlots(orderDelivery, timeZone) {
    if (!orderDelivery.timingsId || !orderDelivery.deliveryWindow.length) {
        return true;
    }

    const query = new CustomQuery('delivery-counts-for-a-day.sql', {
        timingId: orderDelivery.timingsId,
        startTime: Number(orderDelivery.deliveryWindow[0]) / 1000,
        serviceType: orderDelivery.type,
        timeZone: timeZone || 'UTC',
    });
    const [{ maxStops, orderDeliveriesCount, recurringSubscriptionCount }] = await query.execute();
    return (
        !maxStops ||
        Number(maxStops) >
            Number(orderDeliveriesCount || 0) + Number(recurringSubscriptionCount || 0)
    );
}

function canUpdateOrderDelivery(record) {
    return (
        record.status &&
        [orderDeliveryStatuses.SCHEDULED, orderDeliveryStatuses.INTENT_CREATED].includes(
            record.status,
        )
    );
}

async function deliveryTimingSettingsValidation(req, res, next) {
    try {
        const { pickup, return: delivery } = req.body.orderDelivery || {};
        // If pickup or delivery is not there, then return.
        if (!pickup && !delivery) {
            next();
            return;
        }

        const isPickupOwnDelivery = isOwnDelivery(pickup);
        const isReturnOwnDelivery = isOwnDelivery(delivery);

        // If they are not own delivery, we can return as maxStops won't be there.
        if (!isPickupOwnDelivery && !isReturnOwnDelivery) {
            next();
            return;
        }

        req.constants = req.constants || {};
        let pickupChanged = false;
        let returnChanged = false;
        let storeId;

        if (req.constants.from === 'CREATE_ONLINE_ORDER') {
            // For online order
            // pickup is added and we need to validate it.
            // delivery is not mandatory and hence needs to be checked if there is timingsId
            pickupChanged = true;
            returnChanged = delivery && !!delivery.timingsId;
            storeId = req.params.storeId;
        } else {
            const { order } = req.constants;
            req.constants.orderDelivery = await pickupAndDeliveryDetails({
                orderId: order.masterOrderId,
            });
            storeId = req.constants.order.storeId;

            const { orderDelivery } = req.constants;

            // Walk-in Order
            // No Pickup
            // Pre-Processing/Post-Processing - Delivery not mandatory.
            // Delivery not there -> Delivery there - return changed.
            // Delivery not there -> Delivery not there - return not changed.
            // Delivery there -> Delivery there - return might change.
            // Delivery there -> Delivery not there - return changed.

            // Residential Order
            // No Pickup or Delivery

            // Online Order
            // Mandatory Pickup
            // Pickup there -> Pickup there - might change
            // Pre-Processing/Post-Processing - Delivery not mandatory.
            // Delivery not there -> Delivery there - return changed.
            // Delivery not there -> Delivery not there - return not changed.
            // Delivery there -> Delivery there - return might change.
            // Delivery there -> Delivery not there - return changed.

            switch (order.orderType) {
                case ORDER_TYPES.SERVICE:
                    pickupChanged = false;
                    returnChanged =
                        canUpdateOrderDelivery(orderDelivery.delivery) &&
                        hasOrderDeliveryChanged(orderDelivery.delivery || {}, delivery || {});
                    break;
                case ORDER_TYPES.ONLINE:
                    pickupChanged =
                        canUpdateOrderDelivery(orderDelivery.pickup) &&
                        hasOrderDeliveryChanged(orderDelivery.pickup || {}, pickup || {});
                    returnChanged =
                        canUpdateOrderDelivery(orderDelivery.delivery) &&
                        hasOrderDeliveryChanged(orderDelivery.delivery || {}, delivery || {});
                    break;
                default:
                    pickupChanged = false;
                    returnChanged = false;
                    break;
            }
        }

        // If they are as same as the original orderDelivery, then return.
        // This is because the validation is already done once and the count
        // we get here includes this order.
        // If og order deliveries are not there, it means, it is a new record.
        if (!pickupChanged && !returnChanged) {
            next();
            return;
        }

        req.constants.storeSettings = await StoreSettings.query().findOne({
            storeId,
        });
        const { timeZone } = req.constants.storeSettings;

        if (isPickupOwnDelivery && pickupChanged && !(await hasDeliverySlots(pickup, timeZone))) {
            res.status(400).json({
                error: 'No stops are available for this pickup window.',
            });
            return;
        }
        if (isReturnOwnDelivery && returnChanged && !(await hasDeliverySlots(delivery, timeZone))) {
            res.status(400).json({
                error: 'No stops are available for this return window.',
            });
            return;
        }

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = exports = deliveryTimingSettingsValidation;
