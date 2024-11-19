const Pipeline = require('../pipeline');

// Uows
const updateOrderDeliveryStatus = require('../../uow/delivery/dropoff/updateOrderDeliveryStatusUow');
const createOrderActivityLog = require('../../uow/createOrderActivityLogUOW');
const updateServiceOrder = require('../../uow/driverApp/completePickupOrder/updateServiceOrderUOW');
const { orderDeliveryStatuses } = require('../../constants/constants');
const OrderDelivery = require('../../models/orderDelivery');
const Order = require('../../models/orders');

async function getServiceOrder(thirdPartyDeliveryId) {
    const orderDelivery = await OrderDelivery.query().findOne({
        thirdPartyDeliveryId,
    });

    const { serviceOrder } = await Order.query()
        .findById(orderDelivery.orderId)
        .withGraphJoined('serviceOrder');
    return serviceOrder;
}

/**
 * Update the OrderDelivery and customer based on incoming status change
 *
 * The pipeline contains the following units of work:
 *
 * 1) Update the status of the OrderDelivery model;
 * 2) Update the status of the ServiceOrder model based on uber status;
 *
 * @param {Object} payload
 */
async function updateDoorDashPickupPipeline(payload) {
    try {
        const { thirdPartyDeliveryId } = payload;
        const serviceOrder = await getServiceOrder(thirdPartyDeliveryId);
        payload.serviceOrder = serviceOrder;
        const uows = [updateOrderDeliveryStatus];
        if (payload.status === orderDeliveryStatuses.EN_ROUTE_TO_DROP_OFF) {
            uows.push(updateServiceOrder);
        }
        uows.push(createOrderActivityLog);
        const updateDoordashPickupPipeline = new Pipeline(uows);
        const output = await updateDoordashPickupPipeline.run(payload);
        return output;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = updateDoorDashPickupPipeline;
