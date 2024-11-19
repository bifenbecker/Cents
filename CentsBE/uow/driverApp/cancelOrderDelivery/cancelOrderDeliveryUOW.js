const OrderDelivery = require('../../../models/orderDelivery');
const Orders = require('../../../models/orders');
const ServiceOrder = require('../../../models/serviceOrders');
const Store = require('../../../models/store');
const CentsCustomer = require('../../../models/centsCustomer');
const { orderDeliveryStatuses } = require('../../../constants/constants');

async function CancelDeliveryOrder(payload) {
    try {
        const newPayload = payload;
        const { transaction, id, cancellationReason } = payload;

        const orderDelivery = await OrderDelivery.query(transaction)
            .patch({
                status: orderDeliveryStatuses.CANCELED,
                cancellationReason,
            })
            .findById(id)
            .returning('*');
        const order = await Orders.query(transaction)
            .findById(orderDelivery.orderId)
            .andWhere('orderableType', 'ServiceOrder');
        const serviceOrder = await ServiceOrder.query(transaction)
            .withGraphFetched('storeCustomer')
            .findById(order.orderableId)
            .returning('*');
        const storeDetails = await Store.query(transaction).findById(serviceOrder.storeId);
        const centsCustomer = await CentsCustomer.query(transaction).findById(
            serviceOrder.storeCustomer.centsCustomerId,
        );
        newPayload.orderDelivery = orderDelivery;
        newPayload.storeCustomer = serviceOrder.storeCustomer;
        newPayload.serviceOrder = serviceOrder;
        newPayload.order = order;
        newPayload.store = storeDetails;
        newPayload.customer = centsCustomer;

        return newPayload;
    } catch (error) {
        throw Error(error.message);
    }
}

module.exports = CancelDeliveryOrder;
