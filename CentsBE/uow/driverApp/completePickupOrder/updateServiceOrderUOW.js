const ServiceOrder = require('../../../models/serviceOrders');
const { statuses } = require('../../../constants/constants');
const Order = require('../../../models/orders');

/**
 * update a status to 'DRIVER_PICKED_UP_FROM_CUSTOMER' for serviceOrder
 *
 * @param {Object} payload
 */
async function updateServiceOrder(payload) {
    try {
        const newPayload = payload;
        const { transaction, orderDelivery } = newPayload;
        let { serviceOrder } = newPayload;
        if (!serviceOrder) {
            const order = await Order.query(transaction).findById(orderDelivery.orderId);
            serviceOrder = await ServiceOrder.query(transaction).findById(order.orderableId);
            newPayload.serviceOrder = serviceOrder;
        }

        const updatedServiceOrder = await ServiceOrder.query(transaction)
            .patch({
                status: statuses.DRIVER_PICKED_UP_FROM_CUSTOMER,
            })
            .findById(serviceOrder.id)
            .returning('*');

        newPayload.updatedServiceOrder = updatedServiceOrder;
        newPayload.serviceOrder = updatedServiceOrder;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = exports = updateServiceOrder;
