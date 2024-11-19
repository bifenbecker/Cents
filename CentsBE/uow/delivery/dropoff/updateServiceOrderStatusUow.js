const Order = require('../../../models/orders');
const ServiceOrder = require('../../../models/serviceOrders');
const { statuses, orderDeliveryStatuses } = require('../../../constants/constants');

/**
 * Update the status of the ServiceOrder when scheduling a return/dropoff delivery
 *
 * @param {Object} payload
 */
async function updateServiceOrderStatus(payload) {
    try {
        const newPayload = payload;
        const { transaction, orderDelivery } = newPayload;

        /**
         * If the orderDelivery provider is Uber or DoorDash and not "SCHEDULED", it's coming from
         * the EN_ROUTE_TO_DROP_OFF webhook, so mark it as EN_ROUTE_TO_CUSTOMER
         *
         * If not, it means this UoW is utilized in delivery scheduling,
         * so mark it as READY_FOR_DRIVER_PICKUP
         */
        if (orderDelivery && orderDelivery.status === orderDeliveryStatuses.CANCELED) {
            return payload;
        }
        const incomingStatus =
            orderDelivery.deliveryProvider !== 'OWN_DRIVER' && orderDelivery.status !== 'SCHEDULED'
                ? statuses.EN_ROUTE_TO_CUSTOMER
                : statuses.READY_FOR_DRIVER_PICKUP;

        const order = await Order.query(transaction).findById(newPayload.orderDelivery.orderId);
        const serviceOrder = await ServiceOrder.query(transaction)
            .patch({ status: incomingStatus })
            .findById(order.orderableId)
            .returning('*');

        newPayload.serviceOrder = serviceOrder;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = updateServiceOrderStatus;
