const { raw } = require('objection');
const ServiceOrder = require('../../../../models/serviceOrders');

async function getOrderAndCustomer(id) {
    const serviceOrder = await ServiceOrder.query()
        .select(
            'serviceOrders.*',
            'orders.id as masterOrderId',
            'storeCustomers.businessId',
            'storeCustomers.centsCustomerId',
        )
        .join('orders', (builder) => {
            builder
                .on('serviceOrders.id', '=', 'orders.orderableId')
                .andOn('orders.orderableType', '=', raw("'ServiceOrder'"));
        })
        .join('storeCustomers', 'storeCustomers.id', 'serviceOrders.storeCustomerId')
        .where('serviceOrders.id', id)
        .first();
    return serviceOrder;
}

module.exports = exports = {
    getOrderAndCustomer,
};
